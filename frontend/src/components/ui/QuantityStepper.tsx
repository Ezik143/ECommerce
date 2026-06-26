interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export const QuantityStepper = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className = '',
}: QuantityStepperProps) => {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className={`quantity-stepper ${className}`}>
      <button type="button" onClick={decrement} disabled={disabled || value <= min} aria-label="Decrease quantity">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = Math.max(min, Math.min(max, parseInt(e.target.value) || min));
          onChange(newValue);
        }}
        min={min}
        max={max}
        disabled={disabled}
        aria-label="Quantity"
      />
      <button type="button" onClick={increment} disabled={disabled || value >= max} aria-label="Increase quantity">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};