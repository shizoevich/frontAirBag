'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  const observerRef = useRef(null);
  const isVisibleRef = useRef(true);

  // Канал @dmytro_gekalo: UCncoevDhvLF6Ek_0bqO12ug
  // Uploads-плейлист = channel ID с префиксом UU вместо UC (стандарт YouTube).
  // Используем playlistItems.list вместо search.list: search для этого ключа
  // отдаёт 403 accountDelegationForbidden, а playlistItems работает + дешевле (1 ед. квоты vs 100).
  const UPLOADS_PLAYLIST_ID = 'UUncoevDhvLF6Ek_0bqO12ug';
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  // Клиентский кэш: не дёргать YouTube на каждой перезагрузке.
  const CACHE_KEY = 'yt_videos_cache_v1';
  const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 часов

  const readCache = useCallback(() => {
    try {
      if (typeof window === 'undefined') return null;
      const raw = window.localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.videos?.length) return null;
      return parsed; // { ts, videos }
    } catch {
      return null;
    }
  }, []);

  const writeCache = useCallback((videosToCache) => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ ts: Date.now(), videos: videosToCache })
      );
    } catch {
      // ignore storage failures (private mode / disabled storage)
    }
  }, []);

  const cleanupPlayers = useCallback(() => {
  // Останавливаем все видео перед уничтожением
  playersInstances.current.forEach((player, index) => {
    if (player && player.stopVideo) {
      try {
        player.stopVideo();
      } catch (error) {
        console.warn(`Error stopping player ${index}:`, error);
      }
    }
  });
  
  // Уничтожаем плееры
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
}, []);

 useEffect(() => {
    mountedRef.current = true;

    const applyStaleOrEmpty = () => {
      // Фолбэк при ошибке/пустом ответе: показать любой (даже просроченный) кэш,
      // чтобы не выпадала плашка "temporarily unavailable" при разовом сбое.
      const stale = readCache();
      if (mountedRef.current && stale?.videos?.length) {
        setVideos(stale.videos);
      }
    };

    const fetchVideos = async () => {
      // 1) Свежий кэш — отдать без запроса к YouTube.
      const cached = readCache();
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        if (mountedRef.current) {
          setVideos(cached.videos);
          setLoading(false);
        }
        return;
      }

      // 2) Нет ключа — не делать заведомо провальный запрос.
      if (!API_KEY) {
        applyStaleOrEmpty();
        if (mountedRef.current) setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${UPLOADS_PLAYLIST_ID}&part=snippet&maxResults=10`
        );
        const data = await res.json();

        const formatted = (data.items || [])
          .map((item) => {
            const videoId = item?.snippet?.resourceId?.videoId;
            if (!videoId) return null; // приватные/удалённые видео
            const thumbs = item?.snippet?.thumbnails;
            return {
              id: videoId,
              videoId,
              title: item.snippet.title,
              thumbnail: thumbs?.medium?.url || thumbs?.default?.url || '',
            };
          })
          .filter(Boolean);

        if (formatted.length > 0) {
          if (mountedRef.current) setVideos(formatted);
          writeCache(formatted);
        } else {
          // Пустой ответ / ошибка API (403 и т.п.) — фолбэк на кэш.
          applyStaleOrEmpty();
        }
      } catch (err) {
        console.error('YouTube fetch error:', err);
        applyStaleOrEmpty();
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchVideos();

    return () => {
      mountedRef.current = false;
      cleanupPlayers();
    };
  }, [API_KEY, UPLOADS_PLAYLIST_ID, cleanupPlayers, readCache, writeCache, CACHE_TTL_MS]);

  /* =========================
     2️⃣ Page visibility
  ========================== */
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;

      if (!isVisibleRef.current) {
        playersInstances.current.forEach((player) => {
          try {
            player?.stopVideo?.();
          } catch {}
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  /* =========================
     3️⃣ YouTube API Init
  ========================== */
  useEffect(() => {
    if (!videos.length || !mountedRef.current) return;

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initPlayers();
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = initPlayers;
    };

    const initPlayers = () => {
      if (!window.YT?.Player) {
        setTimeout(initPlayers, 100);
        return;
      }

      cleanupPlayers();

      videos.forEach((video, index) => {
        const el = document.getElementById(`youtube-player-${index}`);
        if (!el) return;

        const player = new window.YT.Player(el, {
          videoId: video.videoId,
          playerVars: {
            autoplay: index === 0 ? 1 : 0,
            mute: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: (e) => {
              if (index === 0 && isVisibleRef.current) {
                e.target.playVideo();
              }
            },
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.ENDED) {
                const next = (index + 1) % videos.length;
                setActiveVideoIndex(next);
                playersInstances.current[next]?.playVideo?.();
              }
            },
          },
        });

        playersInstances.current[index] = player;
      });
    };

    loadYouTubeAPI();
  }, [videos, cleanupPlayers]);

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
          color: #f8f8f8;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(235, 91, 8, 0.2);
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