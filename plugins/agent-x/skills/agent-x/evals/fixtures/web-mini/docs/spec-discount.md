# Spec: discount codes in the cart

Users can apply one discount code to the cart total.

Acceptance criteria
- AC-1: `SAVE10` takes 10% off the total, rounded to 2 decimals.
- AC-2: an unknown code leaves the total unchanged and returns an "invalid code" error.
- AC-3: only one code can be active; applying a second replaces the first.
- AC-4: the total never goes below 0.

No Figma design (logic only).
