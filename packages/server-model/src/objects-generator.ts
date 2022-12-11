import { Ellipsis } from "~/Ellipsis";
import { ObjectId } from "~shared/types";

type EllipsisInfo = {
  x: number;
  y: number;
  radius: number;
  color: string;
};

export const generate = (
  canvasWidth: number,
  canvasHeight: number,
  minRadius: number,
  maxRadius: number,
  count: number,
): Ellipsis[] => {
  const res: Ellipsis[] = [];

  for (let i = 0; i < count; i++) {
    const info = generateOne(canvasWidth, canvasHeight, minRadius, maxRadius);
    res.push(
      new Ellipsis(i as ObjectId, info.x, info.y, info.radius, info.color),
    );
  }

  return res;
};

export const generateOne = (
  canvasWidth: number,
  canvasHeight: number,
  minRadius: number,
  maxRadius: number,
): EllipsisInfo => {
  const colorNumber = Math.floor(Math.random() * 16777215).toString(16);
  const color = `#${colorNumber}`;
  const radius = minRadius + Math.random() * (maxRadius - minRadius);
  const xMin = radius;
  const yMin = radius;
  const xMax = canvasWidth - radius;
  const yMax = canvasHeight - radius;

  const x = xMin + Math.random() * (xMax - xMin);
  const y = yMin + Math.random() * (yMax - yMin);

  return { x: x, y: y, radius, color };
};
