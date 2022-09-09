onmessage = ({data}) => {
  setInterval(() => {
    postMessage({
      number: data.number + 1,
    });
  }, 1000);
};
