export const Logo = ({ className = 'h-10 w-auto' }: { className?: string }) => {
  return (
    <svg viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M20 20 Q 40 10, 60 30 T 100 20"
        stroke="#E63946"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 40 Q 40 30, 60 50 T 100 40"
        stroke="#E9C46A"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 60 Q 40 50, 60 70 T 100 60"
        stroke="#2A9D8F"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 80 Q 40 70, 60 90 T 100 80"
        stroke="#457B9D"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <text
        x="120"
        y="68"
        fontFamily="Inter, sans-serif"
        fontWeight="800"
        fontSize="56"
        fill="#003366"
        letterSpacing="-0.05em"
      >
        SACRE
      </text>
    </svg>
  )
}
