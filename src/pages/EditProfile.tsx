import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUser, deleteAccount, logout } from '@/store/slices/authSlice';
import { clearUserCategories } from '@/store/slices/categorySlice';
import { clearUserItems } from '@/store/slices/itemSlice';
import { clearUserOutfits } from '@/store/slices/outfitSlice';
import { clearUserReactions } from '@/store/slices/reactionSlice';
import ImageUploader from '@/components/ImageUploader';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import type { Gender } from '@/types';

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.currentUserId);
  const user = useAppSelector((s) => s.auth.users.find((u) => u.userId === userId));
  const theme = useAppSelector((s) => s.theme.theme);

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [gender, setGender] = useState<Gender>(user?.gender || 'FEMALE');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState('');

  if (!user || !userId) return null;

  const handleSave = () => {
    const updates: Partial<typeof user> & { userId: string } = {
      userId,
      nickname: nickname.trim(),
      gender,
    };
    if (avatar) updates.avatar = avatar;
    if (oldPassword && newPassword) {
      if (oldPassword !== user.password) {
        setToast('旧密码不正确');
        return;
      }
      updates.password = newPassword;
      setOldPassword('');
      setNewPassword('');
    }
    dispatch(updateUser(updates));
    setToast('资料已保存');
  };

  const handleDelete = () => {
    dispatch(clearUserCategories(userId));
    dispatch(clearUserItems(userId));
    dispatch(clearUserOutfits(userId));
    dispatch(clearUserReactions(userId));
    dispatch(deleteAccount(userId));
    dispatch(logout());
    localStorage.removeItem('closetmate_state');
    navigate('/login');
  };

  const bg = theme === 'PINK' ? 'bg-[#FFF5F7]' : 'bg-[#F8F9FA]';
  const primaryText = theme === 'PINK' ? 'text-[#FF6B81]' : 'text-[#2C3E50]';
  const primaryBg = theme === 'PINK' ? 'bg-[#FF6B81]' : 'bg-[#2C3E50]';
  const radius = theme === 'PINK' ? 'rounded-2xl' : 'rounded-lg';

  return (
    <div className={`min-h-screen ${bg}`}>
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white/90 px-5 py-4 backdrop-blur">
        <Link to="/profile" className={primaryText}>
          <ArrowLeft size={24} />
        </Link>
        <h1 className={`text-lg font-bold ${primaryText}`}>编辑资料</h1>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-6">
        <section className={`bg-white p-5 shadow-sm ${radius}`}>
          <div className="mx-auto w-fit">
            <ImageUploader
              value={avatar}
              onChange={setAvatar}
              className="h-24 w-24 rounded-full"
            />
          </div>
        </section>

        <section className={`space-y-4 bg-white p-5 shadow-sm ${radius}`}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">性别</label>
            <div className="flex gap-3">
              {(['FEMALE', 'MALE'] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    gender === g
                      ? `${primaryBg} border-transparent text-white`
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {g === 'FEMALE' ? '女' : '男'}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-400">性别将决定 AI 试穿使用的模特</p>
          </div>
        </section>

        <section className={`space-y-4 bg-white p-5 shadow-sm ${radius}`}>
          <h3 className="font-bold text-gray-700">修改密码</h3>
          <input
            type="password"
            placeholder="旧密码"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
          />
          <input
            type="password"
            placeholder="新密码"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
          />
        </section>

        <button
          onClick={handleSave}
          className={`w-full py-3.5 font-bold text-white shadow-md transition-transform active:scale-95 ${primaryBg} ${radius}`}
        >
          保存修改
        </button>

        <button
          onClick={() => setShowDelete(true)}
          className={`flex w-full items-center justify-center gap-2 py-3.5 font-bold text-red-500 shadow-sm transition-transform active:scale-95 bg-white ${radius}`}
        >
          <Trash2 size={18} />
          注销账号
        </button>
      </main>

      <Modal
        open={showDelete}
        title="确认注销账号"
        onClose={() => setShowDelete(false)}
        footer={
          <>
            <button
              onClick={() => setShowDelete(false)}
              className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white"
            >
              确认注销
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          注销后将删除您的所有数据，包括衣物、分类、搭配和互动记录，此操作不可恢复。
        </p>
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
