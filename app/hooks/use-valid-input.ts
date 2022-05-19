import { useState, useEffect } from "react";

export interface Details {
  label: string;
  isNumeric: boolean;
}

const NON_NUMERIC_INPUT: Details = {
  label: "Non-numeric input",
  isNumeric: false,
};

const INSUFFICIENT_LIQUIDITY: Details = {
  label: "Insufficient liquidity",
  isNumeric: true,
};

const NEGATIVE_OR_ZERO: Details = {
  label: "Please provide value",
  isNumeric: true,
};

export function useValidInput(
  value: string,
  floor: number,
  ciel: number
): [boolean, Details | null] {
  let [isValid, setIsValid] = useState<boolean>(false);
  let [reason, setReason] = useState<Details | null>(null);

  useEffect(() => {
    // Reset reason on each run
    setReason(null);

    try {
      if (isNaN(parseFloat(value))) {
        setReason(NON_NUMERIC_INPUT);
        throw "NaN";
      }

      let v: number = parseFloat(value);

      if (v > floor && v <= ciel) {
        setIsValid(true);
      } else {
        if (v <= floor) {
          setReason(NEGATIVE_OR_ZERO);
        }

        if (v > ciel) {
          setReason(INSUFFICIENT_LIQUIDITY);
        }

        setIsValid(false);
      }
    } catch (e) {
      console.warn(`Invalid input`, e);
      setIsValid(false);
    }
  }, [value, floor, ciel]);

  return [isValid, reason];
}