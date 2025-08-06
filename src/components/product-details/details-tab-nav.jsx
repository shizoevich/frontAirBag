'use client';
import React, { useRef, useEffect } from 'react';

const DetailsTabNav = ({ product }) => {
  const {_id, description, additionalInformation } = product || {};
  const activeRef = useRef(null)
  const marker = useRef(null);
  // handleActive
  const handleActive = (e) => {
    if (e.target.classList.contains('active')) {
      marker.current.style.left = e.target.offsetLeft + "px";
      marker.current.style.width = e.target.offsetWidth + "px";
    }
  }
  useEffect(() => {
    if (activeRef.current?.classList.contains('active')) {
      marker.current.style.left = activeRef.current.offsetLeft + 'px';
      marker.current.style.width = activeRef.current.offsetWidth + 'px';
    }
  }, []);
  // nav item
  function NavItem({ active = false, id, title, linkRef }) {
    return (
      <button
        ref={linkRef}
        className={`nav-link ${active ? "active" : ""}`}
        id={`nav-${id}-tab`}
        data-bs-toggle="tab"
        data-bs-target={`#nav-${id}`}
        type="button"
        role="tab"
        aria-controls={`nav-${id}`}
        aria-selected={active ? "true" : "false"}
        tabIndex="-1"
        onClick={e => handleActive(e)}
      >
        {title}
      </button>
    );
  }

  return (
    <>
          {/* addInfo */}
          <div className="tab-pane fade" id="nav-additional" role="tabpanel" aria-labelledby="nav-additional-tab" tabIndex="-1">

            <div className="tp-product-details-additional-info ">
              <div className="row justify-content-center">
                <div className="col-xl-10">
                  <table>
                    <tbody>
                      {additionalInformation?.map((item, i) => (
                        <tr key={i}>
                          <td>{item.key}</td>
                          <td>{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
    </>
  );
};

export default DetailsTabNav;