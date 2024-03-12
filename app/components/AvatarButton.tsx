import React, { useLayoutEffect, useState } from "react"
import { Image, ImageProps, ImageURISource, Platform, TouchableOpacity } from "react-native"

export interface AvatarButton extends ImageProps {
  /**
   * How wide should the image be?
   */
  maxWidth?: number
  /**
   * How tall should the image be?
   */
  maxHeight?: number

  onPress?: () => void
}

/**
 * A hook that will return the scaled dimensions of an image based on the
 * provided dimensions' aspect ratio. If no desired dimensions are provided,
 * it will return the original dimensions of the remote image.
 *
 * How is this different from `resizeMode: 'contain'`? Firstly, you can
 * specify only one side's size (not both). Secondly, the image will scale to fit
 * the desired dimensions instead of just being contained within its image-container.
 *
 */
export function useAvatarButton(
  remoteUri: string,
  dimensions?: [maxWidth?: number, maxHeight?: number],
): [width: number, height: number] {
  const [[remoteWidth, remoteHeight], setRemoteImageDimensions] = useState([0, 0])
  const remoteAspectRatio = remoteWidth / remoteHeight
  const [maxWidth, maxHeight] = dimensions ?? []

  useLayoutEffect(() => {
    if (!remoteUri) return

    Image.getSize(remoteUri, (w, h) => setRemoteImageDimensions([w, h]))
  }, [remoteUri])

  if (Number.isNaN(remoteAspectRatio)) return [0, 0]

  if (maxWidth && maxHeight) {
    const aspectRatio = Math.min(maxWidth / remoteWidth, maxHeight / remoteHeight)
    return [remoteWidth * aspectRatio, remoteHeight * aspectRatio]
  } else if (maxWidth) {
    return [maxWidth, maxWidth / remoteAspectRatio]
  } else if (maxHeight) {
    return [maxHeight * remoteAspectRatio, maxHeight]
  } else {
    return [remoteWidth, remoteHeight]
  }
}

/**
 * An Image component that automatically sizes a remote or data-uri image.
 *
 * - [Documentation and Examples](https://docs.infinite.red/ignite-cli/boilerplate/components/AutoImage/)
 */
export function AvatarButton(props: AvatarButton) {
  const { maxWidth, maxHeight, onPress, ...ImageProps } = props
  const source = props.source as ImageURISource

  const [width, height] = useAvatarButton(
    Platform.select({
      web: (source?.uri as string) ?? (source as string),
      default: source?.uri as string,
    }),
    [maxWidth, maxHeight],
  )

  return (
    <>
      <TouchableOpacity onPress={props.onPress}>
        <Image {...ImageProps} style={[{ width, height, borderRadius: 50 }, props.style]} />
      </TouchableOpacity>
    </>
  )
}
