function StartWorker() {
  const startWorker = async () => {
    await fetch("http://localhost:5000/worker/start", {
      method: "POST"
    });
  };

  return <button onClick={startWorker}>Start Worker</button>;
}

export default StartWorker;
