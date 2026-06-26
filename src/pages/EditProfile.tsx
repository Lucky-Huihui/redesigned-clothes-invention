import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { updateUser, logout } from '@/store/slices/authSlice';
import { updateProfile, changePassword, deleteAccount } from '@/api/auth';
import { getThemeColors } from '@/utils/theme';

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const theme = useAppSelector((s) => s.theme.theme);
  const colors = getThemeColors(theme);

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>(user?.gender || 'FEMALE');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveProfile = async () => {
    if (!nickname.trim()) { setMessage('昵称不能为空'); return; }
    setLoading(true); setMessage('');
    try {
      const updated = await updateProfile({ nickname: nickname.trim(), gender });
      dispatch(updateUser(updated));
      setMessage('资料已更新');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) { setMessage('请填写完整'); return; }
    if (newPassword.length < 6) { setMessage('新密码不能少于6位'); return; }
    setLoading(true); setMessage('');
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword(''); setNewPassword(''); setShowPassword(false);
      setMessage('密码修改成功');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('确定要注销账号吗？此操作不可撤销，所有数据将被永久删除。')) return;
    if (!confirm('再次确认：注销后所有数据将无法恢复！')) return;
    setLoading(true);
    try {
      await deleteAccount();
      dispatch(logout());
      navigate('/login');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif", maxWidth: '375px', margin: '0 auto', background: colors.bgSecondary }}>
      <nav className="sticky top-0 z-20 flex items-center justify-center h-14 px-4 bg-white border-b" style={{ borderColor: colors.borderLight }}>
        <button onClick={() => navigate('/profile')} className="absolute left-4 w-9 h-9 flex items-center justify-center rounded-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900">编辑资料</h1>
      </nav>

      {message && (
        <div className={`mx-4 mt-4 p-3 rounded-lg text-sm ${message.includes('成功') || message.includes('已更新') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
          {message}
        </div>
      )}

      {/* Profile Form */}
      <section className="mx-4 mt-4 p-4 bg-white rounded-xl" style={{ border: `1px solid ${colors.borderLight}` }}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1.5">昵称</label>
          <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
            className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#E8A0BF] transition-all" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-2">性别</label>
          <div className="flex gap-2.5">
            <button onClick={() => setGender('FEMALE')}
              className="flex-1 h-11 rounded-lg text-sm font-medium transition-all"
              style={{
                background: gender === 'FEMALE' ? colors.primary : colors.bgTertiary,
                color: gender === 'FEMALE' ? colors.textOnPrimary : colors.textSecondary,
                border: gender === 'FEMALE' ? `1px solid ${colors.primary}` : `1px solid ${colors.border}`,
              }}>女</button>
            <button onClick={() => setGender('MALE')}
              className="flex-1 h-11 rounded-lg text-sm font-medium transition-all"
              style={{
                background: gender === 'MALE' ? colors.primary : colors.bgTertiary,
                color: gender === 'MALE' ? colors.textOnPrimary : colors.textSecondary,
                border: gender === 'MALE' ? `1px solid ${colors.primary}` : `1px solid ${colors.border}`,
              }}>男</button>
          </div>
        </div>
        <button onClick={handleSaveProfile} disabled={loading}
          className="w-full h-11 rounded-full text-white text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-50"
          style={{ background: colors.primary }}>保存资料</button>
      </section>

      {/* Password Form */}
      <section className="mx-4 mt-4 p-4 bg-white rounded-xl" style={{ border: `1px solid ${colors.borderLight}` }}>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">修改密码</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1.5">原密码</label>
          <input type={showPassword ? 'text' : 'password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="请输入原密码"
            className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#E8A0BF] transition-all" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1.5">新密码</label>
          <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="请输入新密码（至少6位）"
            className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#E8A0BF] transition-all" />
        </div>
        <button onClick={handleChangePassword} disabled={loading}
          className="w-full h-11 rounded-full text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-50"
          style={{ background: colors.primary, color: colors.textOnPrimary }}>修改密码</button>
      </section>

      {/* Delete Account */}
      <section className="mx-4 mt-4 mb-8 p-4 bg-white rounded-xl" style={{ border: `1px solid ${colors.borderLight}` }}>
        <button onClick={handleDeleteAccount} disabled={loading}
          className="w-full h-11 rounded-full border-2 border-red-300 text-red-400 text-sm font-semibold active:bg-red-50 transition-colors disabled:opacity-50">
          注销账号
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">注销后所有数据将被永久删除且无法恢复</p>
      </section>
    </div>
  );
}
