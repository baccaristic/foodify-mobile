import type { Region } from 'react-native-maps';

import type {
  CreateOrderResponse,
  MonetaryAmount,
  OrderDto,
  OrderStatus,
  OrderWorkflowStepDto,
} from '~/interfaces/Order';

export const DEFAULT_REGION: Region = {
  latitude: 36.8065,
  longitude: 10.1815,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export const STATUS_ALIASES: Record<string, OrderStatus> = {
  READY_FOR_PICKUP: 'READY_FOR_PICK_UP',
  IN_TRANSIT: 'IN_DELIVERY',
  CANCELLED: 'CANCELED',
};

export const STATUS_SEQUENCE: OrderStatus[] = [
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'READY_FOR_PICK_UP',
  'IN_DELIVERY',
  'DELIVERED',
];

export const DEFAULT_WORKFLOW_BLUEPRINT: Pick<
  OrderWorkflowStepDto,
  'step' | 'label' | 'description'
>[] = [
  {
    step: 'PENDING',
    label: 'Order placed',
    description: 'We received your order and sent it to the restaurant.',
  },
  {
    step: 'ACCEPTED',
    label: 'Restaurant accepted',
    description: 'The restaurant confirmed your order and is getting started.',
  },
  {
    step: 'PREPARING',
    label: 'Being prepared',
    description: 'Your dishes are being prepared with care.',
  },
  {
    step: 'READY_FOR_PICK_UP',
    label: 'Ready for pick-up',
    description: 'The courier is heading to the restaurant to collect your food.',
  },
  {
    step: 'IN_DELIVERY',
    label: 'On the way',
    description: 'The courier has your order and is on the way.',
  },
  {
    step: 'DELIVERED',
    label: 'Delivered',
    description: 'Enjoy your meal! The order has been delivered.',
  },
];

export const createDefaultWorkflow = (): OrderWorkflowStepDto[] =>
  DEFAULT_WORKFLOW_BLUEPRINT.map((step) => ({
    ...step,
    status: 'PENDING',
    completed: false,
  }));

export const EMPTY_ORDER: CreateOrderResponse = {
  orderId: -1,
  status: 'PENDING',
  restaurant: {
    id: 0,
    name: 'Your restaurant',
  },
  delivery: {
    address: 'Your delivery address',
    location: {
      lat: DEFAULT_REGION.latitude,
      lng: DEFAULT_REGION.longitude,
    },
    savedAddress: null,
  },
  payment: {
    method: 'UNKNOWN',
    subtotal: 0,
    extrasTotal: 0,
    total: 0,
  },
  items: [],
  workflow: createDefaultWorkflow(),
};

export const normalizeStatus = (status?: string | null): OrderStatus | null => {
  if (!status) {
    return null;
  }

  const normalized = String(status)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  return STATUS_ALIASES[normalized] ?? (normalized as OrderStatus);
};

export const ensureWorkflow = (
  order: CreateOrderResponse | null | undefined,
): OrderWorkflowStepDto[] => {
  const base = order?.workflow?.length ? order.workflow : createDefaultWorkflow();

  return base.map((step, index) => {
    const blueprint = DEFAULT_WORKFLOW_BLUEPRINT[index];
    const normalizedStep = normalizeStatus(step.step ?? blueprint?.step ?? `STEP_${index}`);
    return {
      ...step,
      step: normalizedStep ?? step.step ?? blueprint?.step ?? `STEP_${index}`,
      label: step.label ?? blueprint?.label ?? `Step ${index + 1}`,
      description:
        step.description ?? blueprint?.description ?? 'We will notify you once this updates.',
      completed: Boolean(step.completed),
      status: step.status ?? 'PENDING',
    } satisfies OrderWorkflowStepDto;
  });
};

export const updateWorkflowProgress = (
  workflow: OrderWorkflowStepDto[],
  status?: string | null,
): OrderWorkflowStepDto[] => {
  const normalizedStatus = normalizeStatus(status);
  if (!normalizedStatus) {
    return workflow;
  }

  const statusIndex = STATUS_SEQUENCE.indexOf(normalizedStatus);
  if (statusIndex === -1) {
    return workflow;
  }

  let activeMarked = false;

  return workflow.map((step) => {
    const stepKey = normalizeStatus(step.step);
    if (!stepKey) {
      return step;
    }

    const stepIndex = STATUS_SEQUENCE.indexOf(stepKey);

    if (step.completed || normalizeStatus(step.status) === 'COMPLETED') {
      return {
        ...step,
        completed: true,
        status: 'COMPLETED',
      } satisfies OrderWorkflowStepDto;
    }

    if (stepIndex === -1) {
      return step;
    }

    if (stepIndex < statusIndex) {
      return {
        ...step,
        completed: true,
        status: 'COMPLETED',
      } satisfies OrderWorkflowStepDto;
    }

    if (!activeMarked && stepIndex === statusIndex) {
      activeMarked = true;
      return {
        ...step,
        completed: false,
        status: normalizedStatus,
      } satisfies OrderWorkflowStepDto;
    }

    return {
      ...step,
      completed: false,
      status: 'PENDING',
    } satisfies OrderWorkflowStepDto;
  });
};

export const prepareOrderSnapshot = (
  snapshot: CreateOrderResponse,
  fallbackStatus: OrderStatus = 'PENDING',
): CreateOrderResponse => {
  const normalizedStatus = normalizeStatus(snapshot.status) ?? fallbackStatus;
  return {
    ...snapshot,
    status: normalizedStatus,
    workflow: updateWorkflowProgress(ensureWorkflow(snapshot), normalizedStatus),
  } satisfies CreateOrderResponse;
};

const coerceAmount = (value: MonetaryAmount | null | undefined): MonetaryAmount | null => {
  if (value == null) {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

export const mergeOrderWithUpdate = (
  current: CreateOrderResponse | null,
  update: OrderDto,
): CreateOrderResponse => {
  const normalizedStatus = normalizeStatus(update.status) ?? current?.status ?? 'PENDING';
  const workflow = updateWorkflowProgress(ensureWorkflow(current), normalizedStatus);

  const base: CreateOrderResponse = current
    ? { ...current, workflow }
    : {
        ...EMPTY_ORDER,
        orderId: update.id,
        status: normalizedStatus,
        restaurant: {
          id: update.restaurantId,
          name: update.restaurantName,
        },
        delivery: {
          address: update.clientAddress ?? EMPTY_ORDER.delivery.address,
          location:
            update.clientLocation ??
            current?.delivery?.location ??
            EMPTY_ORDER.delivery.location,
          savedAddress: update.savedAddress ?? null,
        },
        payment: {
          ...EMPTY_ORDER.payment,
          total: update.total ?? EMPTY_ORDER.payment.total,
        },
        workflow,
      };

  return {
    ...base,
    status: normalizedStatus,
    restaurant: {
      ...base.restaurant,
      id: update.restaurantId ?? base.restaurant.id,
      name: update.restaurantName ?? base.restaurant.name,
    },
    delivery: {
      ...base.delivery,
      address: update.clientAddress ?? base.delivery.address,
      location: update.clientLocation ?? base.delivery.location,
      savedAddress: update.savedAddress ?? base.delivery.savedAddress,
    },
    payment: {
      ...base.payment,
      total: coerceAmount(update.total) ?? base.payment.total,
    },
    workflow,
  } satisfies CreateOrderResponse;
};

export const isTerminalStatus = (status?: OrderStatus | null) => {
  const normalized = normalizeStatus(status);
  return (
    normalized === 'DELIVERED' ||
    normalized === 'CANCELED' ||
    normalized === 'REJECTED'
  );
};

export const resolveWebSocketUrl = (
  baseApiUrl: string,
): { url: string; hostHeader: string } => {
  try {
    const url = new URL(baseApiUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '/ws';
    url.search = '';
    url.hash = '';
    return { url: url.toString(), hostHeader: url.host };
  } catch (error) {
    console.warn('Failed to derive websocket URL from base API URL.', error);
    const sanitized = baseApiUrl.replace(/^https?/, 'ws').replace(/\/?api\/?$/, '');
    return { url: `${sanitized.replace(/\/$/, '')}/ws`, hostHeader: sanitized.replace(/^ws[s]?:\/\//, '') };
  }
};

export type StompFrame = {
  command: string;
  headers: Record<string, string>;
  body: string;
};

export const buildStompFrame = (
  command: string,
  headers: Record<string, string>,
  body?: string,
) => {
  const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
  const frame = [command, ...headerLines, '', body ?? ''].join('\n');
  return `${frame}\0`;
};

export const parseStompFrames = (payload: string): StompFrame[] => {
  return payload
    .split('\0')
    .map((frame) => frame.trimStart())
    .filter((frame) => frame.length > 0)
    .map((frame) => {
      const [head, ...rest] = frame.split('\n\n');
      const headerLines = head.split('\n');
      const command = headerLines.shift() ?? '';
      const headers = headerLines.reduce<Record<string, string>>((acc, line) => {
        const [key, ...valueParts] = line.split(':');
        if (key) {
          acc[key.trim()] = valueParts.join(':').trim();
        }
        return acc;
      }, {});
      const body = rest.join('\n\n');
      return { command, headers, body } satisfies StompFrame;
    });
};
