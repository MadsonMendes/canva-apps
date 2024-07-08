import {
  Button,
  Column,
  Columns,
  ImageCard,
  NumberInput,
  PlusIcon,
  Rows,
  Swatch,
  Text,
  TrashIcon,
} from "@canva/app-ui-kit";
import { addNativeElement } from "@canva/design";
import * as React from "react";
import styles from "styles/components.css";
import { upload } from "@canva/asset";
import { Color, openColorSelector } from "@canva/preview/asset";

import { createCanvas } from "canvas";

interface IGradientOptions {
  color: Color;
  position: number;
}

interface IImageOptions {
  width: number;
  height: number;
  angle: number;
}

function getGradientPoints(w: number, h: number, deg: number) {
  var caseAngle1 = Math.round((Math.atan(w / h) * 180) / Math.PI),
    caseAngle2 = Math.round(180 - caseAngle1),
    caseAngle3 = Math.round(180 + caseAngle1),
    caseAngle4 = Math.round(360 - caseAngle1);

  var bx = w / 2,
    tx = w / 2,
    wh = w / 2,
    hh = h / 2,
    ty = h,
    by = 0,
    angInRad = (deg * Math.PI) / 180,
    count1;

  if (deg == caseAngle1) {
    tx = 0;
    bx = w;
  } else if (deg == caseAngle2) {
    tx = 0;
    ty = 0;
    bx = w;
    by = h;
  } else if (deg == caseAngle3) {
    tx = w;
    ty = 0;
    bx = 0;
    by = h;
  } else if (deg == caseAngle4) {
    tx = w;
    ty = h;
    bx = 0;
    by = 0;
  } else {
    var mtan = Math.tan(angInRad);

    if (0 < deg && deg < caseAngle1) {
      count1 = (mtan * h) / 2;
      tx = wh - count1;
      bx = wh + count1;
    } else if (caseAngle1 < deg && deg < caseAngle2) {
      count1 = wh / mtan;
      tx = 0;
      ty = hh + count1;
      bx = w;
      by = hh - count1;
    } else if (caseAngle2 < deg && deg < caseAngle3) {
      count1 = (mtan * h) / 2;
      tx = wh + count1;
      ty = 0;
      bx = wh - count1;
      by = h;
    } else if (caseAngle3 < deg && deg < caseAngle4) {
      count1 = wh / mtan;
      tx = w;
      ty = hh - count1;
      bx = 0;
      by = hh + count1;
    } else if (caseAngle4 < deg && deg < 361) {
      count1 = (mtan * h) / 2;
      tx = wh - count1;
      ty = h;
      bx = wh + count1;
      by = 0;
    }
  }
  return { tx: tx, ty: ty, bx: bx, by: by };
}

const generateGradient = (
  gradientOptions: IGradientOptions[],
  imageOptions: IImageOptions
) => {
  const canvas = createCanvas(imageOptions.width, imageOptions.height);
  const ctx = canvas.getContext("2d");
  const points = getGradientPoints(
    imageOptions.width,
    imageOptions.height,
    imageOptions.angle
  );
  const grad = ctx.createLinearGradient(
    points.tx,
    points.ty,
    points.bx,
    points.by
  );

  gradientOptions.forEach((gradientInfo) => {
    grad.addColorStop(gradientInfo.position / 100, `${gradientInfo.color}`);
  });

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, imageOptions.width, imageOptions.height);

  const dataURL = canvas.toDataURL("image/png");
  return dataURL;
};

const generateGradientPreview = (
  gradientOptions: IGradientOptions[],
  imageOptions: IImageOptions
) => {
  let width = 300;
  let height = 300;
  let angle = imageOptions.angle;
  if (imageOptions.width < imageOptions.height) {
    width = imageOptions.width / (imageOptions.height / 300);
    height = imageOptions.height / (imageOptions.height / 300);
  } else if (imageOptions.width > imageOptions.height) {
    width = imageOptions.width / (imageOptions.width / 300);
    height = imageOptions.height / (imageOptions.width / 300);
  }
  const canvas = createCanvas(300, 300);
  const ctx = canvas.getContext("2d");

  const points = getGradientPoints(width, height, angle);
  const grad = ctx.createLinearGradient(
    points.tx,
    points.ty,
    points.bx,
    points.by
  );

  gradientOptions.forEach((gradientInfo) => {
    grad.addColorStop(gradientInfo.position / 100, `${gradientInfo.color}`);
  });

  ctx.fillStyle = grad;

  ctx.fillRect(0, 0, width, height);

  const dataURL = canvas.toDataURL("image/png");
  return dataURL;
};

const addImageToDesign = async (imageURL: string) => {
  const result = await upload({
    type: "IMAGE",
    mimeType: "image/png",
    url: imageURL,
    thumbnailUrl: imageURL,
  });
  await addNativeElement({
    type: "IMAGE",
    ref: result.ref,
  });
};

export const App = () => {
  const [gradientOptions, setgradientOptions] = React.useState<
    IGradientOptions[]
  >([
    { color: "#22577A", position: 0 },
    { color: "#57CC99", position: 100 },
  ]);
  const [imageOptions, setImageOptions] = React.useState<IImageOptions>({
    width: 500,
    height: 500,
    angle: 180,
  });

  const [imageURL, setImageURL] = React.useState<string | null>(null);
  React.useEffect(() => {
    setImageURL(generateGradientPreview(gradientOptions, imageOptions));
  }, [gradientOptions, imageOptions]);

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="1.5u">
        <Text>Click on below to add your gradient to the design</Text>
        <ImageCard
          alt="Your gradient preview"
          ariaLabel="Click here to add your gradient to the design"
          borderRadius="none"
          onClick={() => {
            addImageToDesign(generateGradient(gradientOptions, imageOptions));
          }}
          onDragStart={() => {}}
          thumbnailUrl={imageURL}
          thumbnailHeight={300}
        />
        <Columns spacing={"1.5u"} align={"spaceBetween"}>
          <Column>
            <Text>Width: </Text>
            <NumberInput
              min={1}
              value={imageOptions.width}
              onChange={(value) => {
                if (typeof value !== "number" || value < 0) {
                  setImageOptions({ ...imageOptions, width: 500 });
                } else {
                  setImageOptions({ ...imageOptions, width: value });
                }
              }}
            />
          </Column>
          <Column>
            <Text>Height: </Text>
            <NumberInput
              min={1}
              value={imageOptions.height}
              onChange={(value) => {
                if (typeof value !== "number" || value < 0) {
                  setImageOptions({ ...imageOptions, height: 500 });
                } else {
                  setImageOptions({ ...imageOptions, height: value });
                }
              }}
            />
          </Column>
          <Column>
            <Text>Angle: </Text>
            <NumberInput
              min={0}
              value={imageOptions.angle}
              onChange={(value) => {
                if (typeof value !== "number") {
                  setImageOptions({ ...imageOptions, angle: 0 });
                } else {
                  setImageOptions({ ...imageOptions, angle: value });
                }
              }}
            />
          </Column>
        </Columns>
        <Text>Colors and positions:</Text>
        {gradientOptions.map(
          (gradientInfo: IGradientOptions, index: number) => {
            return (
              <>
                <Rows spacing="1.5u" align="start">
                  <Columns spacing={"1u"} align="start">
                    <Column width={"containedContent"}>
                      <Swatch
                        fill={[gradientInfo.color]}
                        onClick={async (event) => {
                          const anchor =
                            event.currentTarget.getBoundingClientRect();
                          await openColorSelector(anchor, {
                            scopes: ["solid"],
                            onColorSelect: (event) => {
                              if (event.selection.type === "solid") {
                                const newGradientColors = [...gradientOptions];
                                newGradientColors[index].color =
                                  event.selection.hexString;
                                setgradientOptions(newGradientColors);
                              }
                            },
                          });
                        }}
                      ></Swatch>
                    </Column>
                    <Column width={"content"}>
                      <NumberInput
                        min={0}
                        max={100}
                        value={gradientInfo.position}
                        onChange={(value) => {
                          if (
                            typeof value !== "number" ||
                            value > 100 ||
                            value < 0
                          ) {
                            const newGradientPositions = [...gradientOptions];
                            newGradientPositions[index].position = 0;
                            setgradientOptions(newGradientPositions);
                          } else {
                            const newGradientPositions = [...gradientOptions];
                            newGradientPositions[index].position = value;
                            setgradientOptions(newGradientPositions);
                          }
                        }}
                      />
                    </Column>

                    {gradientOptions.length > 2 ? (
                      <Button
                        variant={"tertiary"}
                        icon={() => <TrashIcon />}
                        onClick={() => {
                          const newGradientPositions = [...gradientOptions];
                          newGradientPositions.splice(index, 1);
                          setgradientOptions(newGradientPositions);
                        }}
                      ></Button>
                    ) : (
                      <></>
                    )}
                  </Columns>
                </Rows>
              </>
            );
          }
        )}
        {gradientOptions.length <= 30 ? (
          <Button
            variant={"primary"}
            icon={() => <PlusIcon />}
            onClick={() => {
              const newGradientPositions = [...gradientOptions];
              newGradientPositions.push({
                color: "#22577A",
                position: 0,
              });
              setgradientOptions(newGradientPositions);
            }}
          ></Button>
        ) : (
          <></>
        )}
      </Rows>
    </div>
  );
};
