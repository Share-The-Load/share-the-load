import { format, parseISO } from "date-fns"
import { enUS } from "date-fns/locale"

type Options = Parameters<typeof format>[2]

export const formatDate = (date: string, dateFormat?: string, options?: Options) => {
  const dateOptions = {
    ...options,
    locale: enUS,
  }
  return format(parseISO(date), dateFormat ?? "MMM dd, yyyy", dateOptions)
}
