import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { updateUser, logout } from '@/store/slices/authSlice';
import { updateProfile, changePassword, deleteAccount } from '@/api/auth';
import { getErrorMessage } from '@/utils/error';
import { cn } from '@/lib/utils';

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

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
    } catch (err) {
      setMessage(getErrorMessage(err));
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
    } catch (err) {
      setMessage(getErrorMessage(err));
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
    } catch (err) {
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <nav className="sticky top-0 z-sticky flex items-center justify-center h-14 px-4 bg-surface border-b border-border-light safe-top">
        <button onClick={() => navigate('/profile')} className="absolute left-4 w-9 h-9 flex items-center justify-center rounded-lg text-ink">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m7-7-7 7 7 7"/>
          </svg>
        </button>
        <h1 className="text-base font-semibold text-ink">编辑资料</h1>
      </nav>

      {message && (
        <div className={cn(
          'mx-4 mt-4 p-3 rounded-lg text-sm animate-fade-in',
          message.includes('成功') || message.includes('已更新') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
        )}>
          {message}
        </div>
      )}

      {/* Profile Form */}
      <section className="card mx-4 mt-4 p-4">
        <div className="mb-4">
          <label className="form-label">昵称</label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="mb-4">
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
        <button onClick={handleSaveProfile} disabled={loading} className="btn-primary">
          {loading ? '保存中...' : '保存资料'}
        </button>
      </section>

      {/* Password Form */}
      <section className="card mx-4 mt-4 p-4">
        <h2 className="text-sm font-semibold text-ink mb-4">修改密码</h2>
        <div className="mb-4">
          <label className="form-label">原密码</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="请输入原密码"
              className="form-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="form-label">新密码</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="请输入新密码（至少6位）"
              className="form-input pr-10"
            />
          </div>
        </div>
        <button onClick={handleChangePassword} disabled={loading} className="btn-primary">
          {loading ? '修改中...' : '修改密码'}
        </button>
      </section>

      {/* Delete Account */}
      <section className="card mx-4 mt-4 mb-8 p-4">
        <button onClick={handleDeleteAccount} disabled={loading}
          className="w-full h-11 rounded-full border-2 border-error/50 text-error text-sm font-semibold active:bg-error/5 transition-colors disabled:opacity-50">
          注销账号
        </button>
        <p className="text-xs text-ink-3 text-center mt-2">注销后所有数据将被永久删除且无法恢复</p>
      </section>
    </div>
  );
}
