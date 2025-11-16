# iOS Live Activity Implementation Guide

This document provides instructions for implementing the native iOS module for Live Activities in the Foodify app.

## Overview

The app includes a JavaScript/TypeScript interface for iOS Live Activities that manages ongoing food delivery orders. The native iOS implementation needs to be added after running `expo prebuild`.

## What's Already Implemented

1. **JavaScript Service** (`src/services/liveActivity.ts`):
   - `LiveActivityService` class that manages activity lifecycle
   - Mock implementation for development
   - Helper functions to create activity attributes from order data

2. **React Hook** (`src/hooks/useLiveActivity.ts`):
   - Custom hook that monitors ongoing orders
   - Automatically starts/updates/ends Live Activities based on order status
   - Integrated into the app via `LiveActivityManager` component

3. **Integration** (`src/components/LiveActivityManager.tsx`):
   - Component that initializes Live Activity management
   - Placed within the `OngoingOrderProvider` context

4. **iOS Configuration** (`app.config.js`):
   - `NSSupportsLiveActivities` set to `true` in `infoPlist`

## Native Module Implementation (Post-Prebuild)

After running `expo prebuild`, you'll need to implement the native iOS module:

### 1. Create the Native Module

Create a new Swift file in your iOS project: `LiveActivityModule.swift`

```swift
import Foundation
import ActivityKit
import React

@objc(LiveActivityModule)
class LiveActivityModule: NSObject {
  
  private var currentActivity: Activity<FoodifyOrderTrackingAttributes>?
  
  @objc
  func areActivitiesEnabled(_ resolve: @escaping RCTPromiseResolveBlock, 
                           reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.1, *) {
      resolve(ActivityAuthorizationInfo().areActivitiesEnabled)
    } else {
      resolve(false)
    }
  }
  
  @objc
  func startActivity(_ activityType: String,
                     attributes: NSDictionary,
                     contentState: NSDictionary,
                     resolve: @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.1, *) {
      do {
        // Parse attributes
        let attrs = try parseFoodifyAttributes(from: attributes)
        let state = try parseContentState(from: contentState)
        
        // Create activity
        let activity = try Activity<FoodifyOrderTrackingAttributes>.request(
          attributes: attrs,
          contentState: state,
          pushType: nil
        )
        
        self.currentActivity = activity
        resolve(activity.id)
      } catch {
        reject("START_ERROR", "Failed to start Live Activity: \(error.localizedDescription)", error)
      }
    } else {
      reject("NOT_SUPPORTED", "Live Activities require iOS 16.1+", nil)
    }
  }
  
  @objc
  func updateActivity(_ activityId: String,
                      contentState: NSDictionary,
                      resolve: @escaping RCTPromiseResolveBlock,
                      reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.1, *) {
      guard let activity = self.currentActivity else {
        reject("NO_ACTIVITY", "No active Live Activity found", nil)
        return
      }
      
      do {
        let state = try parseContentState(from: contentState)
        Task {
          await activity.update(using: state)
          resolve(nil)
        }
      } catch {
        reject("UPDATE_ERROR", "Failed to update Live Activity: \(error.localizedDescription)", error)
      }
    } else {
      reject("NOT_SUPPORTED", "Live Activities require iOS 16.1+", nil)
    }
  }
  
  @objc
  func endActivity(_ activityId: String,
                   resolve: @escaping RCTPromiseResolveBlock,
                   reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.1, *) {
      guard let activity = self.currentActivity else {
        reject("NO_ACTIVITY", "No active Live Activity found", nil)
        return
      }
      
      Task {
        await activity.end(dismissalPolicy: .default)
        self.currentActivity = nil
        resolve(nil)
      }
    } else {
      reject("NOT_SUPPORTED", "Live Activities require iOS 16.1+", nil)
    }
  }
  
  // Helper functions to parse data
  private func parseFoodifyAttributes(from dict: NSDictionary) throws -> FoodifyOrderTrackingAttributes {
    guard let orderId = dict["orderId"] as? String,
          let restaurantName = dict["restaurantName"] as? String,
          let status = dict["status"] as? String,
          let statusLabel = dict["statusLabel"] as? String else {
      throw NSError(domain: "LiveActivityModule", code: -1, 
                   userInfo: [NSLocalizedDescriptionKey: "Missing required attributes"])
    }
    
    return FoodifyOrderTrackingAttributes(
      orderId: orderId,
      restaurantName: restaurantName,
      status: status,
      statusLabel: statusLabel,
      itemsCount: dict["itemsCount"] as? Int ?? 0
    )
  }
  
  private func parseContentState(from dict: NSDictionary) throws -> FoodifyOrderTrackingAttributes.ContentState {
    guard let status = dict["status"] as? String,
          let statusLabel = dict["statusLabel"] as? String else {
      throw NSError(domain: "LiveActivityModule", code: -1,
                   userInfo: [NSLocalizedDescriptionKey: "Missing required content state"])
    }
    
    return FoodifyOrderTrackingAttributes.ContentState(
      status: status,
      statusLabel: statusLabel,
      courierName: dict["courierName"] as? String,
      estimatedReadyAt: dict["estimatedReadyAt"] as? String,
      lastUpdatedAt: dict["lastUpdatedAt"] as? String ?? ISO8601DateFormatter().string(from: Date())
    )
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
```

### 2. Create the Bridge Header

Create `LiveActivityModule.m`:

```objc
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LiveActivityModule, NSObject)

RCT_EXTERN_METHOD(areActivitiesEnabled:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startActivity:(NSString *)activityType
                  attributes:(NSDictionary *)attributes
                  contentState:(NSDictionary *)contentState
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateActivity:(NSString *)activityId
                  contentState:(NSDictionary *)contentState
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(endActivity:(NSString *)activityId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
```

### 3. Define Activity Attributes

Create `FoodifyOrderTrackingAttributes.swift`:

```swift
import ActivityKit
import Foundation

struct FoodifyOrderTrackingAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var status: String
    var statusLabel: String
    var courierName: String?
    var estimatedReadyAt: String?
    var lastUpdatedAt: String
  }
  
  var orderId: String
  var restaurantName: String
  var status: String
  var statusLabel: String
  var itemsCount: Int
}
```

### 4. Create the Live Activity Widget

Create a Widget Extension target and add the Live Activity view:

```swift
import WidgetKit
import SwiftUI
import ActivityKit

struct FoodifyOrderTrackingLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: FoodifyOrderTrackingAttributes.self) { context in
      // Lock screen/banner UI
      VStack {
        HStack {
          VStack(alignment: .leading) {
            Text(context.attributes.restaurantName)
              .font(.headline)
            Text("Order #\(context.attributes.orderId)")
              .font(.caption)
              .foregroundColor(.secondary)
          }
          Spacer()
          Text(context.state.statusLabel)
            .font(.caption)
            .padding(6)
            .background(Color.orange.opacity(0.2))
            .cornerRadius(8)
        }
        
        if let courierName = context.state.courierName {
          HStack {
            Image(systemName: "bicycle")
            Text("Courier: \(courierName)")
              .font(.caption)
          }
          .padding(.top, 4)
        }
      }
      .padding()
      .activityBackgroundTint(Color.white)
      .activitySystemActionForegroundColor(Color.orange)
      
    } dynamicIsland: { context in
      // Dynamic Island UI
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Image(systemName: "fork.knife")
            .foregroundColor(.orange)
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text(context.state.statusLabel)
            .font(.caption2)
        }
        DynamicIslandExpandedRegion(.center) {
          Text(context.attributes.restaurantName)
            .font(.caption)
            .lineLimit(1)
        }
        DynamicIslandExpandedRegion(.bottom) {
          if let courier = context.state.courierName {
            HStack {
              Image(systemName: "bicycle")
              Text(courier)
            }
            .font(.caption2)
          }
        }
      } compactLeading: {
        Image(systemName: "fork.knife")
          .foregroundColor(.orange)
      } compactTrailing: {
        Text(context.state.statusLabel)
          .font(.caption2)
      } minimal: {
        Image(systemName: "fork.knife")
          .foregroundColor(.orange)
      }
    }
  }
}
```

### 5. Update Info.plist

Add to your app's `Info.plist`:

```xml
<key>NSSupportsLiveActivities</key>
<true/>
```

### 6. Add ActivityKit Capability

1. In Xcode, select your project target
2. Go to "Signing & Capabilities"
3. Click "+ Capability"
4. Add "Push Notifications" (for remote updates, optional)

## Testing

1. Run `expo prebuild` to generate native iOS project
2. Implement the native module code as described above
3. Build and run on a physical iOS device (Live Activities don't work in simulator for iOS < 16.2)
4. Place an order and navigate to the order tracking screen
5. The Live Activity should appear on the lock screen and Dynamic Island

## Features

- **Automatic Management**: Live Activities are automatically started when an order enters tracking mode
- **Real-time Updates**: Activity updates automatically when order status changes via WebSocket
- **Terminal States**: Activity ends automatically when order is delivered, cancelled, or rejected
- **Smart Cleanup**: Prevents multiple activities for the same order

## Order Statuses Displayed

- PENDING - Order received
- ACCEPTED - Restaurant accepted
- PREPARING - Food is being prepared
- READY_FOR_PICK_UP - Ready for pickup
- IN_DELIVERY - Out for delivery
- DELIVERED - Order delivered (ends activity)
- CANCELLED/REJECTED - Order cancelled (ends activity)

## Notes

- Live Activities require iOS 16.1+
- Works best on iPhone 14 Pro and later (Dynamic Island)
- Activities can persist even when app is closed
- Mock implementation logs to console in development
