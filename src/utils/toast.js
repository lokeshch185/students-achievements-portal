import { toast } from "react-toastify"

const baseOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
}

const messageFromError = (error, fallback) => {
  if (!error) return fallback
  if (typeof error === "string") return error
  return error.error || error.message || fallback
}

export const showSuccess = (message, options = {}) =>
  toast.success(message, { ...baseOptions, ...options })

export const showError = (error, fallback = "Something went wrong", options = {}) =>
  toast.error(messageFromError(error, fallback), { ...baseOptions, ...options })

export const showInfo = (message, options = {}) =>
  toast.info(message, { ...baseOptions, ...options })

export const showWarning = (message, options = {}) =>
  toast.warning(message, { ...baseOptions, ...options })

export const showPromise = (promise, { pending, success, error }) =>
  toast.promise(promise, { pending, success, error }, baseOptions)

export default {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showPromise,
}

