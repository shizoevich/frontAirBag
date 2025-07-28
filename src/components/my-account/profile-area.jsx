'use client'
import React,{ useEffect } from "react";
import ProfileNavTab from "./profile-nav-tab";
import ProfileShape from "./profile-shape";
import NavProfileTab from "./nav-profile-tab";
import ProfileInfo from "./profile-info";
import ChangePassword from "./change-password";
import MyOrders from "./my-orders";
import { useGetUserOrdersQuery } from "@/redux/features/order/orderApi";
import Loader from "../loader/loader";
import { useRouter } from "next/navigation";
import ErrorMsg from "../common/error-msg";
import Cookies from "js-cookie";

const ProfileArea = () => {
  const router = useRouter();
  const { data: orderData, isError, isLoading, } = useGetUserOrdersQuery();
  useEffect(() => {
    const isAuthenticate = Cookies.get("userInfo");
    if (!isAuthenticate) {
      router.push("/login");
    }
  }, [router]);

  let content = null;
  if (isLoading) {
    content = <div
      className="d-flex align-items-center justify-content-center"
      style={{ height: "100vh" }}
    >
      <Loader loading={isLoading} />
    </div>
  }
  if (!isLoading && isError) {
    content = <div
      className="d-flex align-items-center justify-content-center"
      style={{ height: "100vh" }}
    >
      <ErrorMsg msg="There was an error" />
    </div>
  }
  if (!isLoading && !isError) {
   content = <section className="profile__area pt-120 pb-120">
      <div className="container">
        <div className="profile__inner p-relative">
          <ProfileShape />
          <div className="row">
            <div className="col-xxl-4 col-lg-4">
              <div className="profile__tab mr-40">
                <ProfileNavTab />
              </div>
            </div>
            <div className="col-xxl-8 col-lg-8">
              <div className="profile__tab-content">
                <div className="tab-content" id="profile-tabContent">
                  <div
                    className="tab-pane fade show active"
                    id="nav-profile"
                    role="tabpanel"
                    aria-labelledby="nav-profile-tab"
                  >
                    <NavProfileTab orderData={orderData} />
                  </div>

                  <div
                    className="tab-pane fade"
                    id="nav-information"
                    role="tabpanel"
                    aria-labelledby="nav-information-tab"
                  >
                    <ProfileInfo />
                  </div>

                  <div
                    className="tab-pane fade"
                    id="nav-password"
                    role="tabpanel"
                    aria-labelledby="nav-password-tab"
                  >
                    <ChangePassword />
                  </div>

                  <div
                    className="tab-pane fade"
                    id="nav-order"
                    role="tabpanel"
                    aria-labelledby="nav-order-tab"
                  >
                    <MyOrders orderData={orderData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  }
  return (
    <>
      {content}
    </>
  );
};

export default ProfileArea;
