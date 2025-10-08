import { useDriverShiftContext } from '~/context/DriverShiftContext';

const useDriverShift = () => {
  const context = useDriverShiftContext();
  return context;
};

export default useDriverShift;
