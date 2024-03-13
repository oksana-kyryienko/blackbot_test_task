import React, { useState, useEffect, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import './App.css';

const SOCKET_ENDPOINT = 'wss://stream.binance.com:9443/ws/ethusdt@trade';

const App: React.FC = () => {
  const [ethAmount, setEthAmount] = useState<number>(0);
  const [action, setAction] = useState<string>('buy');
  const [usdtAmount, setUsdtAmount] = useState<number | null>(null);
  const [inputStarted, setInputStarted] = useState<boolean>(false);

  const updateUsdtAmount = useCallback(
    (value: number, action: string, ethUsdtPrice: number) => {
      const calculatedAmount =
        action === 'buy' ? value * ethUsdtPrice : value / ethUsdtPrice;
      setUsdtAmount(calculatedAmount);
    },
    [setUsdtAmount]
  );

  useEffect(() => {
    const socket = new WebSocket(SOCKET_ENDPOINT);

    socket.onmessage = (event) => {
      const tradeData = JSON.parse(event.data);
      updateUsdtAmount(ethAmount, action, tradeData.p);
    };

    return () => socket.close();
  }, [action, ethAmount, updateUsdtAmount]);

  const handleEthAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setEthAmount(isNaN(value) ? 0 : value);
    setInputStarted(true);
  };

  const handleToggle = () => {
    setAction(action === 'buy' ? 'sell' : 'buy');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const memoizedUsdtAmount = useMemo(() => {
    return typeof usdtAmount === 'number' && !isNaN(usdtAmount)
      ? usdtAmount.toFixed(2)
      : '';
  }, [usdtAmount]);

  return (
    <div className="container">
      <h1>USDT/ETH Exchange</h1>
      <form onSubmit={handleSubmit}>
        <label>
          ETH Amount:
          <input
            className="input-field"
            type="number"
            value={inputStarted ? ethAmount.toString() : ''}
            onChange={handleEthAmountChange}
          />
        </label>
        <div className="action">
          <span>{action === 'buy' ? 'Buy' : 'Sell'}</span>
          <button
            className={classNames('button', 'toggle-button', action)}
            onClick={handleToggle}
          >
            <div className="slider"></div>
          </button>
        </div>
      </form>
      <h2>You will receive:</h2>
      <div className="result-container">
        <p className="result-text">{memoizedUsdtAmount} USDT</p>
      </div>
    </div>
  );
};

export default App;
