import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '@/store/slices/authSlice';
import { initializeDefaultCategories } from '@/store/slices/categorySlice';
import { useAppDispatch, useAppSelector } from '@/store';
import type { Gender, LoginType } from '@/types';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.theme.theme);
  const [loginType, setLoginType] = useState<LoginType>('PHONE');
  const [account, setAccount] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<Gender>('FEMALE');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!account.trim() || !nickname.trim() || !password) {
      setError('请填写完整信息');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    dispatch(
      register({
        nickname: nickname.trim(),
        password,
        gender,
        [loginType === 'PHONE' ? 'phone' : 'email']: account.trim(),
      })
    );
    // register slice sets currentUser, but we need userId for default categories.
    // We read from store after dispatch.
    const nextUserId = JSON.parse(localStorage.getItem('closetmate_state') || '{}').currentUserId;
    if (nextUserId) {
      dispatch(initializeDefaultCategories(nextUserId));
      navigate('/items');
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
        <h1 className={`mb-6 text-center text-2xl font-bold ${text}`}>注册账号</h1>

        <div className={`mb-6 flex rounded-full p-1 bg-white`}>
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
            type="text"
            placeholder="请输入昵称"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 ${
              theme === 'PINK'
                ? 'border-[#FF6B81]/20 focus:border-[#FF6B81] focus:ring-[#FF6B81]/20'
                : 'border-[#2C3E50]/20 focus:border-[#2C3E50] focus:ring-[#2C3E50]/20'
            }`}
          />
          <div className="flex gap-3">
            {(['FEMALE', 'MALE'] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-colors ${
                  gender === g
                    ? `${primary} border-transparent text-white`
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                {g === 'FEMALE' ? '女' : '男'}
              </button>
            ))}
          </div>
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
          <input
            type="password"
            placeholder="确认密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            注册
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          已有账号？
          <Link to="/login" className={`font-medium ${text}`}>
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}
