import React, { useEffect, useRef, useState } from "react";
import "../styles/profilePage.css";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {clearAuthData} from "../redux/authSlice";
import useApiClient from "../utils/requestController";

const AVATAR_PLACEHOLDER_DATAURL =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#67e8f9"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <circle cx="256" cy="200" r="110" fill="#ffffff" opacity="0.85"/>
  <rect x="118" y="320" width="276" height="130" rx="65" fill="#ffffff" opacity="0.85"/>
</svg>
`);

const MyProfilePage = () => {
    const api = useApiClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [restarting, setRestarting] = useState(false);
    const [error, setError] = useState("");
    const token = useSelector((state) => state.auth.token);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [profile, setProfile] = useState({
        name: "",
        bio: "",
        avatarUrl: "",
    });

    // Редактируемые поля
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");
    const [avatarPreview, setAvatarPreview] = useState(""); // локальный preview
    const avatarFileRef = useRef(null);
    const fileInputRef = useRef(null);

    const pickAvatarDataUrl = (base64, mime = "image/jpeg") =>
        base64 ? `data:${mime};base64,${base64}` : AVATAR_PLACEHOLDER_DATAURL;

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const response = await api.get('/getMyProfile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log(response.data);

                const base64 = response.data.userAvatar;
                const avatar = pickAvatarDataUrl(base64, "image/jpeg");

                setProfile({
                    name: response.data.username,
                    bio: response.data.bio || "",
                    avatarUrl: avatar
            });
                setEditName(response.data.name);
                setEditName(response.data.username || "");
                setEditBio(response.data.bio || "");
                setAvatarPreview(avatar || AVATAR_PLACEHOLDER_DATAURL);
            } catch (e) {
                if (!cancelled) {
                    setError("Не удалось загрузить профиль. Попробуйте обновить страницу.");
                    setAvatarPreview(AVATAR_PLACEHOLDER_DATAURL);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
            if (avatarPreview && avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, []);

    const onAvatarClick = () => {
        if (!isEditing) return;
        fileInputRef.current?.click();
    };

    // Выбор файла аватара
    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // простая валидация
        if (!file.type.startsWith("image/")) {
            alert("Выберите файл изображения (PNG/JPG/WebP).");
            e.target.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("Размер изображения должен быть не более 5 МБ.");
            e.target.value = "";
            return;
        }
        avatarFileRef.current = file;
        const url = URL.createObjectURL(file);
        if (avatarPreview && avatarPreview.startsWith("blob:")) {
            URL.revokeObjectURL(avatarPreview);
        }
        setAvatarPreview(url);
    };

    const enterEdit = () => {
        setIsEditing(true);
        setEditName(profile.name);
        setEditBio(profile.bio);
        setAvatarPreview(profile.avatarUrl || AVATAR_PLACEHOLDER_DATAURL);
        avatarFileRef.current = null;
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditName(profile.name);
        setEditBio(profile.bio);
        if (avatarPreview && avatarPreview.startsWith("blob:")) {
            URL.revokeObjectURL(avatarPreview);
        }
        setAvatarPreview(profile.avatarUrl || AVATAR_PLACEHOLDER_DATAURL);
        if (fileInputRef.current) fileInputRef.current.value = "";
        avatarFileRef.current = null;
    };

    const saveProfile = async () => {
        setSaving(true);
        setError("");
        try {

            const formData = new FormData();

            const payload = {
                username: editName.trim(),
                bio: editBio.trim(),
            };

            formData.append("payload", new Blob([JSON.stringify(payload)], {
                type: "application/json"
            }));

            formData.append("logo", avatarFileRef.current || null);

            const response = await api.post("/changeProfile", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });




        } catch (e) {
            setError("Не удалось сохранить профиль. Проверьте сеть и попробуйте снова.");
        } finally {
            setSaving(false);
            window.location.reload();
        }
    };

    const brag = async () => {
        const url = `${window.location.origin}/u/${profile.id || "me"}`;
        const text = `Это мой профиль и достижения!`;
        try {
            if (navigator.share) {
                await navigator.share({ title: "Мой профиль", text, url });
                return;
            }
        } catch {
            /* игнор */
        }
        try {
            await navigator.clipboard.writeText(url);
            alert("Ссылка на профиль скопирована в буфер обмена.");
        } catch {
            prompt("Скопируйте ссылку на профиль:", url);
        }
    };

    const deleteProfile = async () => {
        if (!window.confirm("Точно удалить профиль? Действие необратимо.")) return;
        setDeleting(true);
        setError("");
        try {
            const res = await axios.get('http://localhost:8080/deleteMyAccount', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            dispatch(clearAuthData());
            navigate('/');
        } catch (e) {
            setError("Удалить профиль не удалось. Попробуйте ещё раз.");
        } finally {
            setDeleting(false);
        }
    };

    const restartGame = async () => {
        if (!window.confirm("Начать игру заново? Текущий прогресс будет сброшен.")) return;
        setRestarting(true);
        setError("");
        try {
            const res = await fetch("/api/game/restart", {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error(`POST /api/game/restart -> ${res.status}`);
            window.location.href = "/game";
        } catch (e) {
            setError("Не удалось начать игру заново. Попробуйте позже.");
        } finally {
            setRestarting(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-page-container">
                {/* Блок 1: Аватар */}
                <div className="grid-box1">
                    <div
                        className={`avatar-wrapper ${isEditing ? "editable" : ""}`}
                        onClick={onAvatarClick}
                        role={isEditing ? "button" : undefined}
                        aria-label={isEditing ? "Загрузить новый аватар" : "Аватар"}
                        title={isEditing ? "Нажмите, чтобы выбрать изображение" : "Аватар"}
                    >
                        {loading ? (
                            <div className="avatar-skeleton" />
                        ) : (
                            <img
                                src={avatarPreview || AVATAR_PLACEHOLDER_DATAURL}
                                alt="Аватар пользователя"
                                className="avatar-image"
                                draggable={false}
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden-file-input"
                            ref={fileInputRef}
                            onChange={onFileChange}
                            aria-hidden={!isEditing}
                            tabIndex={isEditing ? 0 : -1}
                        />
                        {isEditing && <div className="avatar-overlay">Изменить</div>}
                    </div>
                </div>

                <div className="grid-box2">
                    {loading ? (
                        <div className="box2-skeleton">
                            <div className="sk-line lg" />
                            <div className="sk-line md" />
                            <div className="sk-line sm" />
                        </div>
                    ) : (
                        <div className="identity">
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        className="name-input"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        maxLength={50}
                                        autoFocus
                                        placeholder="Имя"
                                    />
                                    <textarea
                                        className="bio-input"
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        maxLength={300}
                                        placeholder="Расскажите о себе…"
                                        rows={5}
                                    />
                                </>
                            ) : (
                                <>
                                    <h1 className="user-name" title={profile.name || "Без имени"}>
                                        {profile.name || "Без имени"}
                                    </h1>
                                    <div className="bio-view" title={profile.bio || "Био пусто"}>
                                        {profile.bio ? <p>{profile.bio}</p> : <span className="muted">Био пока пусто</span>}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Блок 3: кнопки редактирования и «Похвастаться» */}
                <div className="grid-box3">
                    <div className="actions-left">
                        {!isEditing ? (
                            <>
                                <button className="btn primary" onClick={enterEdit} disabled={loading}>
                                    Изменить профиль
                                </button>
                                <button className="btn ghost" onClick={brag} disabled={loading}>
                                    Похвастаться
                                </button>
                                <button type="button" className="btn secondary"
                                        onClick={() => navigate('/becomeAdminPage')}>
                                    Стать админом
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn success" onClick={saveProfile} disabled={saving}>
                                    {saving ? "Сохраняю…" : "Сохранить"}
                                </button>
                                <button className="btn secondary" onClick={cancelEdit} disabled={saving}>
                                    Отменить
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid-box4">
                    <div className="actions-bottom">
                        <button className="btn danger" onClick={deleteProfile} disabled={deleting}>
                            {deleting ? "Удаляю…" : "Удалить аккаунт"}
                        </button>
                        <button className="btn warning" onClick={restartGame} disabled={restarting}>
                            {restarting ? "Перезапуск…" : "Новая игра"}
                        </button>
                    </div>
                    {error && <div className="error-box">{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage;
