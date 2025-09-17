import toast from 'react-hot-toast';

// Toast system using react-hot-toast - compatible with Next.js 15.4.2
// Styles are configured globally in Providers component
const notifySuccess = (message) => {
  if (typeof window !== 'undefined') {
    toast.success(message);
  } else {
    console.log('✓ Success:', message);
  }
};

const notifyError = (message) => {
  if (typeof window !== 'undefined') {
    toast.error(message);
  } else {
    console.log('✕ Error:', message);
  }
};

const notifyInfo = (message) => {
  if (typeof window !== 'undefined') {
    toast(message, {
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
    });
  } else {
    console.log('ℹ Info:', message);
  }
};

export { notifySuccess, notifyError, notifyInfo };
