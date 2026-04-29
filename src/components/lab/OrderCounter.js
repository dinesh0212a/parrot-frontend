import { Component } from 'react';

class OrderCounter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: props.initialCount || 0,
      isRunning: false,
      secondsElapsed: 0,
      lastUpdated: new Date().toLocaleTimeString()
    };
    this.timerRef = null;
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {}

  componentWillUnmount() {
    if (this.timerRef) clearInterval(this.timerRef);
  }

  startTimer = () => {
    if (this.state.isRunning) return;
    this.timerRef = setInterval(() => {
      this.setState(prev => ({ secondsElapsed: prev.secondsElapsed + 1 }));
    }, 1000);
    this.setState({ isRunning: true });
  };

  stopTimer = () => {
    clearInterval(this.timerRef);
    this.setState({ isRunning: false });
  };

  increment = () => {
    this.setState(prev => ({
      count: prev.count + 1,
      lastUpdated: new Date().toLocaleTimeString()
    }));
  };

  decrement = () => {
    this.setState(prev => ({
      count: Math.max(0, prev.count - 1),
      lastUpdated: new Date().toLocaleTimeString()
    }));
  };

  reset = () => {
    this.stopTimer();
    this.setState({ count: 0, secondsElapsed: 0, isRunning: false, lastUpdated: new Date().toLocaleTimeString() });
  };

  render() {
    const { count, isRunning, secondsElapsed, lastUpdated } = this.state;
    const { label = 'Orders' } = this.props;

    return (
      <div style={{
        background: 'linear-gradient(135deg,#1a1a2e,#16213e)',
        borderRadius: 20, padding: 24, color: 'white',
        border: '2px solid rgba(255,107,53,0.3)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
          📦 {label}
        </div>

        <div style={{ fontSize: 52, fontWeight: 800, color: '#ff6b35', lineHeight: 1 }}>
          {count}
        </div>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
          ⏱ Session: {secondsElapsed}s &nbsp;|&nbsp; Updated: {lastUpdated}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={this.decrement} style={btnStyle('#e74c3c')}>− Dec</button>
          <button onClick={this.increment} style={btnStyle('#2ecc71')}>+ Inc</button>
          <button onClick={this.reset}     style={btnStyle('#888')}>↺ Reset</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button onClick={this.startTimer} disabled={isRunning}
            style={btnStyle(isRunning ? '#555' : '#3498db', isRunning)}>
            ▶ Start Timer
          </button>
          <button onClick={this.stopTimer} disabled={!isRunning}
            style={btnStyle(!isRunning ? '#555' : '#f39c12', !isRunning)}>
            ⏸ Stop Timer
          </button>
        </div>
      </div>
    );
  }
}

const btnStyle = (bg, disabled = false) => ({
  background: disabled ? '#333' : bg,
  color: disabled ? '#666' : 'white',
  border: 'none', borderRadius: 10, padding: '8px 14px',
  fontSize: 12, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'Poppins, sans-serif', flex: 1, transition: 'all .2s'
});

export default OrderCounter;
