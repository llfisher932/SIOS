// Server stores 10 digits; show them as (555) 123-4567.
const PhoneNumber = ({ digits }: { digits: string }) => (
  <>{digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : digits}</>
);

export default PhoneNumber;
