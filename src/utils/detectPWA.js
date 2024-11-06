export const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  };