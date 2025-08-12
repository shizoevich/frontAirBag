import React, { useState, useEffect } from 'react';
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Yup from "yup";
// internal
import ErrorMsg from '../common/error-msg';
import { EmailTwo, LocationTwo, PhoneThree, UserThree } from '@/svg';
import { useUpdateProfileMutation } from '@/redux/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import { useTranslations } from 'next-intl';

// yup schema
const getSchema = (t) => Yup.object().shape({
  username: Yup.string().required().label(t?.('username') || "Username"),
  email: Yup.string().required().email().label(t?.('email') || "Email"),
  phone: Yup.string().required().min(10).label(t?.('phone') || "Phone"),
  address: Yup.string().required().label(t?.('address') || "Address"),
});

const ProfileInfo = () => {
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('Profile');
  
  const [updateProfile] = useUpdateProfileMutation();
  
  // react hook form с динамической схемой валидации
  const {register, handleSubmit, formState: { errors }, reset, setValue} = useForm({
    resolver: yupResolver(getSchema(t)),
  });
  
  // Заполняем форму данными пользователя при их получении
  useEffect(() => {
    if (user) {
      setValue('username', user.username || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      setValue('address', user.address || '');
    }
  }, [user, setValue]);
  
  // on submit
  const onSubmit = (data) => {
    setIsLoading(true);
    updateProfile({
      username: data.username,
      email: data.email,
      phone: data.phone,
      address: data.address,
    }).unwrap()
      .then((result) => {
        notifySuccess(t('profileUpdateSuccess'));
      })
      .catch((error) => {
        notifyError(error?.data?.detail || t('profileUpdateError'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <div className="profile__info">
      <h3 className="profile__info-title">{t('personalDetails')}</h3>
      <div className="profile__info-content">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input 
                    {...register("username", { required: t('usernameRequired') })} 
                    name='username' 
                    type="text" 
                    placeholder={t('enterUsername')} 
                  />
                  <span>
                    <UserThree/>
                  </span>
                  <ErrorMsg msg={errors.username?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input 
                    {...register("email", { required: t('emailRequired') })} 
                    name='email' 
                    type="email" 
                    placeholder={t('enterEmail')} 
                  />
                  <span>
                    <EmailTwo/>
                  </span>
                  <ErrorMsg msg={errors.email?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input 
                    {...register("phone", { required: t('phoneRequired') })} 
                    name='phone' 
                    type="text" 
                    placeholder={t('enterPhone')} 
                  />
                  <span>
                    <PhoneThree/>
                  </span>
                  <ErrorMsg msg={errors.phone?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input 
                    {...register("address", { required: t('addressRequired') })} 
                    name='address' 
                    type="text" 
                    placeholder={t('enterAddress')} 
                  />
                  <span>
                    <LocationTwo/>
                  </span>
                  <ErrorMsg msg={errors.address?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <textarea {...register("bio", { required: true })} name='bio' placeholder="Enter your bio" defaultValue="Hi there, this is my bio..." />
                  <ErrorMsg msg={errors.bio?.message} />
                </div>
              </div>
            </div>
            <div className="col-xxl-12">
              <div className="profile__btn">
                <button 
                  type="submit" 
                  className="tp-btn" 
                  disabled={isLoading}
                >
                  {isLoading ? t('updating') : t('update')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileInfo;