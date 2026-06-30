import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, Check } from 'lucide-react';
import { login, register } from '@/api/auth';
import { setAuth } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store';
import { getErrorMessage } from '@/utils/error';
import { cn } from '@/lib/utils';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'FEMALE' | 'MALE'>('FEMALE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const switchTab = (next: 'login' | 'register') => {
    setTab(next);
    setError('');
  };

  const startCountdown = () => {
    if (countdown > 0) return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!account || !password) {
      setError('请输入账号和密码');
      return;
    }
    setLoading(true);
    try {
      const res = await login(account, password);
      dispatch(setAuth({ user: res.user, token: res.token }));
      navigate('/items');
    } catch (err) {
      setError(getErrorMessage(err, '登录失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!account) {
      setError('请输入手机号或邮箱');
      return;
    }
    if (!password || password.length < 6) {
      setError('密码不能少于6位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    setLoading(true);
    try {
      const isEmail = account.includes('@');
      const data: { password: string; gender: string; phone?: string; email?: string } = { password, gender };
      if (isEmail) data.email = account;
      else data.phone = account;

      const res = await register(data);
      dispatch(setAuth({ user: res.user, token: res.token }));
      navigate('/items');
    } catch (err) {
      setError(getErrorMessage(err, '注册失败'));
    } finally {
      setLoading(false);
    }
  };

  const renderTab = (key: 'login' | 'register', label: string) => {
    const active = tab === key;
    return (
      <button
        type="button"
        onClick={() => switchTab(key)}
        className={cn(
          'relative pb-2.5 text-base transition-colors duration-150 bg-transparent border-none',
          active ? 'text-primary font-semibold' : 'text-ink-3'
        )}
      >
        {label}
        <span
          className={cn(
            'absolute bottom-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-sm bg-primary transition-all duration-200',
            active ? 'w-8' : 'w-0'
          )}
        />
      </button>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-primary-bg to-primary-subtle">
      {/* Decorative background icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute opacity-[0.06] text-primary" style={{ top: '8%', left: '6%', width: 48, height: 48 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46 16 2 12 3.46 8 2 3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z"/>
        </svg>
        <svg className="absolute opacity-[0.06] text-primary" style={{ top: '18%', right: '8%', width: 36, height: 36 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
        <svg className="absolute opacity-[0.06] text-primary" style={{ bottom: '12%', left: '10%', width: 40, height: 40 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
        </svg>
        <svg className="absolute opacity-[0.06] text-primary" style={{ bottom: '22%', right: '6%', width: 32, height: 32 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>
        </svg>
      </div>

      <div className="relative w-full max-w-[375px]">
        <div className="rounded-2xl bg-white p-8 border border-border-light shadow-lg animate-fade-slide-up">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-primary-bg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">衣橱搭配</h1>
            <p className="text-sm text-ink-3 mt-1.5">智能管理你的每一件衣物</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 mb-6 border-b border-border-light">
            {renderTab('login', '登录')}
            {renderTab('register', '注册')}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="animate-fade-slide-up">
              <div className="mb-4">
                <label className="form-label">手机号 / 邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-3" />
                  <input
                    type="text"
                    placeholder="请输入手机号或邮箱"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="form-label">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-3" />
                  <input
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? '登录中...' : '登录'}
              </button>
              <p className="text-center mt-4 text-sm text-ink-3">
                还没有账号？
                <span onClick={() => switchTab('register')} className="text-primary font-medium cursor-pointer">
                  立即注册
                </span>
              </p>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="animate-fade-slide-up">
              <div className="mb-4">
                <label className="form-label">手机号 / 邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-3" />
                  <input
                    type="text"
                    placeholder="请输入手机号或邮箱"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">验证码</label>
                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-3" />
                    <input
                      type="text"
                      placeholder="请输入验证码"
                      className="form-input pl-10"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={startCountdown}
                    disabled={countdown > 0}
                    className="flex-shrink-0 h-12 px-4 rounded-md border border-primary bg-primary-bg text-primary text-sm font-medium whitespace-nowrap transition-opacity disabled:opacity-60"
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-3" />
                  <input
                    type="password"
                    placeholder="请设置密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label">确认密码</label>
                <div className="relative">
                  <Check className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-3" />
                  <input
                    type="password"
                    placeholder="请再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="form-label">性别</label>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGender('FEMALE')}
                    className={cn(
                      'flex-1 h-11 rounded-lg text-sm font-medium transition-all border',
                      gender === 'FEMALE'
                        ? 'bg-primary text-brand-ink border-primary'
                        : 'bg-bg-secondary text-ink-2 border-border'
                    )}
                  >
                    女
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('MALE')}
                    className={cn(
                      'flex-1 h-11 rounded-lg text-sm font-medium transition-all border',
                      gender === 'MALE'
                        ? 'bg-primary text-brand-ink border-primary'
                        : 'bg-bg-secondary text-ink-2 border-border'
                    )}
                  >
                    男
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? '注册中...' : '注册'}
              </button>
              <p className="text-center mt-4 text-sm text-ink-3">
                已有账号？
                <span onClick={() => switchTab('login')} className="text-primary font-medium cursor-pointer">
                  立即登录
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
