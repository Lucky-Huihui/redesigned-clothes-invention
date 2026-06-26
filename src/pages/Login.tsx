import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '@/api/auth';
import { setAuth } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'FEMALE' | 'MALE'>('FEMALE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!account || !password) { setError('请输入账号和密码'); return; }
    setLoading(true);
    try {
      const res = await login(account, password);
      dispatch(setAuth({ user: res.user, token: res.token }));
      navigate('/items');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!account) { setError('请输入手机号或邮箱'); return; }
    if (!password || password.length < 6) { setError('密码不能少于6位'); return; }
    if (password !== confirmPassword) { setError('两次密码不一致'); return; }
    setLoading(true);
    try {
      const isEmail = account.includes('@');
      const data: any = { password, gender };
      if (isEmail) data.email = account;
      else data.phone = account;
      if (nickname) data.nickname = nickname;

      const res = await register(data);
      dispatch(setAuth({ user: res.user, token: res.token }));
      navigate('/items');
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(180deg, #FDF2F8 0%, #FCEEF5 100%)',
        fontFamily: "'Inter', 'Noto Sans SC', -apple-system, sans-serif",
      }}>
      <div className="w-full max-w-[375px]">
        <div className="rounded-2xl bg-white p-8 border border-[#F3F4F6]" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: '#FDF2F8' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8A0BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 3.46 16 2 12 3.46 8 2 3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">衣橱搭配</h1>
            <p className="text-sm text-gray-400 mt-1.5">智能管理你的每一件衣物</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 mb-6 border-b border-[#F3F4F6]">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className="relative pb-2.5 text-base transition-colors duration-150"
              style={{
                color: tab === 'login' ? '#E8A0BF' : '#9CA3AF',
                fontWeight: tab === 'login' ? 600 : 400,
              }}
            >
              登录
              {tab === 'login' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-sm bg-[#E8A0BF]" />}
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className="relative pb-2.5 text-base transition-colors duration-150"
              style={{
                color: tab === 'register' ? '#E8A0BF' : '#9CA3AF',
                fontWeight: tab === 'register' ? 600 : 400,
              }}
            >
              注册
              {tab === 'register' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-sm bg-[#E8A0BF]" />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-500 text-sm">{error}</div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1.5">手机号 / 邮箱</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input type="text" placeholder="请输入手机号或邮箱" value={account} onChange={e => setAccount(e.target.value)}
                    className="w-full h-12 pl-10 pr-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-base text-gray-900 focus:outline-none focus:border-[#E8A0BF] focus:ring-2 focus:ring-[#E8A0BF]/20 transition-all" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500 mb-1.5">密码</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type="password" placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full h-12 pl-10 pr-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-base text-gray-900 focus:outline-none focus:border-[#E8A0BF] focus:ring-2 focus:ring-[#E8A0BF]/20 transition-all" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-full bg-[#E8A0BF] text-white text-base font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
              >{loading ? '登录中...' : '登录'}</button>
              <p className="text-center mt-4 text-sm text-gray-400">
                还没有账号？<span onClick={() => setTab('register')} className="text-[#E8A0BF] font-medium cursor-pointer">立即注册</span>
              </p>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1.5">手机号 / 邮箱</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input type="text" placeholder="请输入手机号或邮箱" value={account} onChange={e => setAccount(e.target.value)}
                    className="w-full h-12 pl-10 pr-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-base text-gray-900 focus:outline-none focus:border-[#E8A0BF] focus:ring-2 focus:ring-[#E8A0BF]/20 transition-all" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1.5">昵称 <span className="text-gray-300">(选填)</span></label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input type="text" placeholder="请输入昵称" value={nickname} onChange={e => setNickname(e.target.value)}
                    className="w-full h-12 pl-10 pr-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-base text-gray-900 focus:outline-none focus:border-[#E8A0BF] focus:ring-2 focus:ring-[#E8A0BF]/20 transition-all" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1.5">密码</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type="password" placeholder="请设置密码" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full h-12 pl-10 pr-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-base text-gray-900 focus:outline-none focus:border-[#E8A0BF] focus:ring-2 focus:ring-[#E8A0BF]/20 transition-all" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1.5">确认密码</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 6 9 17l-5-5"/></svg>
                  <input type="password" placeholder="请再次输入密码" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full h-12 pl-10 pr-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-base text-gray-900 focus:outline-none focus:border-[#E8A0BF] focus:ring-2 focus:ring-[#E8A0BF]/20 transition-all" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500 mb-2">性别</label>
                <div className="flex gap-2.5">
                  <button type="button" onClick={() => setGender('FEMALE')}
                    className="flex-1 h-11 rounded-lg text-sm font-medium transition-all duration-150"
                    style={{
                      background: gender === 'FEMALE' ? '#E8A0BF' : '#F9FAFB',
                      color: gender === 'FEMALE' ? '#FFFFFF' : '#6B7280',
                      border: gender === 'FEMALE' ? '1px solid #E8A0BF' : '1px solid #E5E7EB',
                    }}
                  >女</button>
                  <button type="button" onClick={() => setGender('MALE')}
                    className="flex-1 h-11 rounded-lg text-sm font-medium transition-all duration-150"
                    style={{
                      background: gender === 'MALE' ? '#E8A0BF' : '#F9FAFB',
                      color: gender === 'MALE' ? '#FFFFFF' : '#6B7280',
                      border: gender === 'MALE' ? '1px solid #E8A0BF' : '1px solid #E5E7EB',
                    }}
                  >男</button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-full bg-[#E8A0BF] text-white text-base font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
              >{loading ? '注册中...' : '注册'}</button>
              <p className="text-center mt-4 text-sm text-gray-400">
                已有账号？<span onClick={() => setTab('login')} className="text-[#E8A0BF] font-medium cursor-pointer">立即登录</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
