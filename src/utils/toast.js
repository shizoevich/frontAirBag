// Custom toast system - compatible with Next.js 15.4.2
const notifySuccess = (message) => {
  if (typeof window !== 'undefined' && window.addToast) {
    window.addToast(message, 'success');
  } else {
    console.log('✓ Success:', message);
  }
};

const notifyError = (message) => {
  if (typeof window !== 'undefined' && window.addToast) {
    window.addToast(message, 'error');
  } else {
    console.log('✕ Error:', message);
  }
};

const notifyInfo = (message) => {
  if (typeof window !== 'undefined' && window.addToast) {
    window.addToast(message, 'info');
  } else {
    console.log('ℹ Info:', message);
  }
};

export { notifySuccess, notifyError, notifyInfo };
