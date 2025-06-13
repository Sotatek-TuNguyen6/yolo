import Image from "next/image";
import React, { FC, useContext } from "react";
import { roundDecimal } from "../Util/utilFunc";

type Props = {
  img: string;
  name: string;
  price: number;
  qty: number;
  colorName?: string;
  colorCode?: string;
  size?: string;
  onAdd?: () => void;
  onRemove?: () => void;
  onDelete?: () => void;
};

const Item: FC<Props> = ({
  img,
  name,
  price,
  qty,
  colorName,
  colorCode,
  size,
  onAdd,
  onRemove,
  onDelete,
}) => {
  return (
    <div className="item flex bg-white my-4 border-b-2 pb-4 border-gray-200">
      <Image
        className="w-2/12"
        src={img}
        alt={name}
        width={70}
        height={104}
        objectFit="contain"
      />
      <div className="midPart mx-4 flex-grow">
        <span>{name}</span>
        {(colorName || size) && (
          <div className="text-sm text-gray-500 mt-1">
            {colorName && (
              <div className="flex items-center">
                <span>Màu: {colorName}</span>
                {colorCode && (
                  <div
                    className="ml-2 w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: colorCode }}
                  ></div>
                )}
              </div>
            )}
            {size && <div>Kích thước: {size}</div>}
          </div>
        )}
        <div className="plusOrMinus w-2/6 mt-4 flex border border-gray300 divide-x-2 divide-gray300">
          <div
            onClick={onRemove}
            className="h-full w-12 flex justify-center items-center cursor-pointer hover:bg-gray-500 hover:text-gray100"
          >
            -
          </div>
          <div className="h-full w-12 flex justify-center items-center pointer-events-none">
            {qty}
          </div>
          <div
            onClick={onAdd}
            className="h-full w-12 flex justify-center items-center cursor-pointer hover:bg-gray-500 hover:text-gray100"
          >
            +
          </div>
        </div>
      </div>
      <div className="lastPart flex flex-col items-end">
        <button
          onClick={onDelete}
          type="button"
          className="outline-none text-gray-300 hover:text-gray-500 focus:outline-none text-xl mb-3"
        >
          &#10005;
        </button>
        <span>$ {roundDecimal(price)}</span>
      </div>
    </div>
  );
};

export default Item;
