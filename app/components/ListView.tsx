import React, { forwardRef } from "react"
import { FlashList, FlashListProps } from "@shopify/flash-list"

export type ListViewRef<T> = FlashList<T>

export type ListViewProps<T> = React.PropsWithoutRef<FlashListProps<T>>

/**
 * A wrapper around FlashList for consistent list rendering.
 */
const ListViewComponent = forwardRef(
  <T,>(props: ListViewProps<T>, ref: React.ForwardedRef<ListViewRef<T>>) => {
    return <FlashList {...props} ref={ref} />
  },
)

ListViewComponent.displayName = "ListView"

export const ListView = ListViewComponent as <T>(
  props: ListViewProps<T> & {
    ref?: React.RefObject<ListViewRef<T>>
  },
) => React.ReactElement
