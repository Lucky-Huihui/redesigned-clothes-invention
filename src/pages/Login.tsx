import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import type { LoginType } from '@/types';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.theme.theme);
  const [loginType, setLoginType] = useState<LoginType>('PHONE');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!account.trim() || !password) {
      setError('请填写账号和密码');
      return;
    }
    dispatch(login({ account: account.trim(), password }));
    const users = JSON.parse(localStorage.getItem('closetmate_state') || '{}').users || [];
    const found = users.find(
      (u: { phone?: string; email?: string; nickname?: string; password: string }) =>
        (u.phone === account || u.email === account || u.nickname === account) &&
        u.password === password
    );
    if (found) {
      navigate('/items');
    } else {
      setError('账号或密码错误');
    }
  };

  const cardBg = theme === 'PINK' ? 'bg-[#FFF5F7]' : 'bg-[#F8F9FA]';
  const primary = theme === 'PINK' ? 'bg-[#FF6B81]' : 'bg-[#2C3E50]';
  const text = theme === 'PINK' ? 'text-[#FF6B81]' : 'text-[#2C3E50]';
  const radius = theme === 'PINK' ? 'rounded-[20px]' : 'rounded-lg';

  return (
    <div
      className={`flex min-h-screen items-center justify-center p-6 ${
        theme === 'PINK' ? 'bg-white' : 'bg-gray-50'
      }`}
    >
      <div className={`w-full max-w-sm ${cardBg} p-8 shadow-xl ${radius}`}>
        <h1 className={`mb-2 text-center text-2xl font-bold ${text}`}>ClosetMate</h1>
        <p className="mb-6 text-center text-sm text-gray-500">衣橱搭配助手</p>

        <div className={`mb-6 flex rounded-full p-1 ${theme === 'PINK' ? 'bg-white' : 'bg-white'}`}>
          {(['PHONE', 'EMAIL'] as LoginType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setLoginType(t)}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                loginType === t ? `${primary} text-white` : `text-gray-500`
              }`}
            >
              {t === 'PHONE' ? '手机号' : '邮箱'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type={loginType === 'PHONE' ? 'tel' : 'email'}
            placeholder={loginType === 'PHONE' ? '请输入手机号' : '请输入邮箱'}
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 ${
              theme === 'PINK'
                ? 'border-[#FF6B81]/20 focus:border-[#FF6B81] focus:ring-[#FF6B81]/20'
                : 'border-[#2C3E50]/20 focus:border-[#2C3E50] focus:ring-[#2C3E50]/20'
            }`}
          />
          <input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 ${
              theme === 'PINK'
                ? 'border-[#FF6B81]/20 focus:border-[#FF6B81] focus:ring-[#FF6B81]/20'
                : 'border-[#2C3E50]/20 focus:border-[#2C3E50] focus:ring-[#2C3E50]/20'
            }`}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className={`w-full py-3 font-semibold text-white shadow-md transition-transform active:scale-95 ${primary} ${radius}`}
          >
            登录
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          还没有账号？
          <Link to="/register" className={`font-medium ${text}`}>
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
