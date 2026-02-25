'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const YouTubeVideosSlider = () => {
  const t = useTranslations('YouTube');
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const playerRefs = useRef([]);
  const playersInstances = useRef([]);
  const mountedRef = useRef(true);

  // YouTube channel ID для @dmytro_gekalo
  const CHANNEL_ID = 'UCncoevDhvLF6Ek_0bqO12ug';
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  // Cleanup function for players
  const cleanupPlayers = () => {
    playersInstances.current.forEach((player, index) => {
      if (player && player.destroy) {
        try {
          player.destroy();
        } catch (error) {
          console.warn(`Error destroying player ${index}:`, error);
        }
      }
    });
    playersInstances.current = [];
    playerRefs.current = [];
  };

  useEffect(() => {
    mountedRef.current = true;
    
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`
        );
        const data = await response.json();
        
        if (data.items && mountedRef.current) {
          const videoData = data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            videoId: item.id.videoId
          }));
          setVideos(videoData);
        }
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchVideos();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      cleanupPlayers();
    };
  }, [API_KEY, CHANNEL_ID]);

  // Load YouTube IFrame API when videos are loaded
  useEffect(() => {
    if (videos.length === 0 || !mountedRef.current) return;

    // Load YouTube IFrame API script only once
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Wait for API to be ready and initialize players
    const initPlayers = () => {
      if (!window.YT || !window.YT.Player || !mountedRef.current) {
        setTimeout(initPlayers, 100);
        return;
      }

      videos.forEach((video, index) => {
        const container = document.getElementById(`youtube-player-${index}`);
        if (container && !playersInstances.current[index]) {
          try {
            const player = new window.YT.Player(`youtube-player-${index}`, {
                playerVars: {
                    autoplay: index === 0 ? 1 : 0,
                    mute: 1,
                    controls: 0,
                    rel: 0,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    fs: 0,
                    disablekb: 1,
                    playsinline: 1,
                    enablejsapi: 1, // must be 1 иначе баги
                },
                events: {
                  onReady: (event) => {
                    // Отключаем аналитику после инициализации
                    if (event.target && event.target.playerInfo) {
                      try {
                        // Пытаемся отключить аналитику программно
              
                      } catch (e) {
                        // Игнорируем ошибки
                      }
                    }
                    
                    if (index === 0) {
                      event.target.playVideo();
                    }
                  },
                onStateChange: (event) => {
                  if (event.data === window.YT.PlayerState.ENDED) {
                    // Play next video
                    const nextIndex = (index + 1) % videos.length;
                    setActiveVideoIndex(nextIndex);
                    if (playersInstances.current[nextIndex]) {
                      playersInstances.current[nextIndex].playVideo();
                    }
                  }
                },
              },
            });
            playersInstances.current[index] = player;
          } catch (error) {
            console.error(`Error creating player ${index}:`, error);
          }
        }
      });
    };

    initPlayers();
  }, [videos]);

  // Handle slide change
  const handleSlideChange = (swiper) => {
    const newIndex = swiper.activeIndex;
    setActiveVideoIndex(newIndex);
    
    // Stop all videos and play active one
    playersInstances.current.forEach((player, index) => {
      if (player) {
        try {
          if (index === newIndex) {
            player.playVideo();
          } else {
            player.stopVideo();
          }
        } catch (error) {
          console.warn(`Error controlling player ${index}:`, error);
        }
      }
    });
  };

  if (loading) {
    return (
      <section className="tp-youtube-area pb-55 pt-55">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="tp-youtube-area pb-40 pt-40 pr-50 pl-50 mr-50 ml-50">
        <div className="container-fluid px-4">
          <div className="row">
            <div className="col-12">
              <div className="text-center text-muted">
                <p>YouTube videos temporarily unavailable</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tp-product-area pb-55">
      <div className="container">
        <div className="row">
          <div className="col-12">
          <Swiper
              modules={[Navigation]}
              spaceBetween={3}
              slidesPerView={1}
              navigation={true}
              onSlideChange={handleSlideChange}
              breakpoints={{
                360: {
                  slidesPerView: 2,
                },
                480: {
                  slidesPerView: 2,
                },
                576: {
                  slidesPerView: 3,
                },
                768: {
                  slidesPerView: 3,
                },
                1024: {
                  slidesPerView: 4,
                },
                1280: {
                  slidesPerView: 5,
                },
                1536: {
                  slidesPerView: 6,
                },
              }}
              className="youtube-reels-slider"
            >
              {videos.map((video, index) => (
                <SwiperSlide key={video.id}>
                  <div className="youtube-reel-card">
                    <div className="youtube-reel-player">
                      <div
                        id={`youtube-player-${index}`}
                        ref={(el) => (playerRefs.current[index] = el)}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .youtube-reels-slider {
          padding: 10px 0;
        }
        
        .youtube-reels-slider .swiper-button-next,
        .youtube-reels-slider .swiper-button-prev {
          color: #de8043;
          background: white;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 10;
        }
        
        .youtube-reels-slider .swiper-button-next:after,
        .youtube-reels-slider .swiper-button-prev:after {
          font-size: 16px;
        }
        
        .youtube-reel-card {
          transition: transform 0.3s ease;
          cursor: pointer;
        }
        
        .youtube-reel-card:hover {
          transform: scale(1.05);
        }
        
        .youtube-reel-player {
          position: relative;
          width: 180px;
          height: 320px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          background: #000;
          margin: 0 auto;
        }
        
        .youtube-reel-player iframe {
          display: block;
          height: 100% !important;
          border: none;
        }
        
        /* Мобильные устройства */
        @media (max-width: 480px) {
          .youtube-reel-player {
            width: 140px;
            height: 250px;
          }
          
          .youtube-reels-slider .swiper-button-next,
          .youtube-reels-slider .swiper-button-prev {
            width: 30px;
            height: 30px;
          }
          
          .youtube-reels-slider .swiper-button-next:after,
          .youtube-reels-slider .swiper-button-prev:after {
            font-size: 14px;
          }
        }
        
        @media (max-width: 576px) {
          .youtube-reel-player {
            width: 150px;
            height: 270px;
          }
        }
        
        @media (max-width: 768px) {
          .youtube-reel-player {
            width: 160px;
            height: 285px;
          }
          
          .tp-youtube-area {
            padding-left: 20px !important;
            padding-right: 20px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
        }
        
        @media (max-width: 992px) {
          .youtube-reel-player {
            width: 170px;
            height: 300px;
          }
        }
        
        /* Скрываем кнопки на очень маленьких экранах */
        @media (max-width: 360px) {
          .youtube-reels-slider .swiper-button-next,
          .youtube-reels-slider .swiper-button-prev {
            display: none;
          }
          
          .youtube-reel-player {
            width: 120px;
            height: 220px;
          }
        }
      `}</style>
    </section>
  );
};

export default YouTubeVideosSlider;