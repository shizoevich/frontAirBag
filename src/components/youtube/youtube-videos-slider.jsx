'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useTranslations } from 'next-intl';

const YouTubeVideosSlider = () => {
  const t = useTranslations('YouTube');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const playerRefs = useRef([]);
  const playersInstances = useRef([]);

  // YouTube channel ID для @dmytro_gekalo
  const CHANNEL_ID = 'UCncoevDhvLF6Ek_0bqO12ug';
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`
        );
        const data = await response.json();
        
        if (data.items) {
          const videoData = data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            videoId: item.id.videoId
          }));
          setVideos(videoData);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        setLoading(false);
      }
    };

    fetchVideos();
  }, [API_KEY, CHANNEL_ID]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined' || videos.length === 0) return;

    // Load YouTube IFrame API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Function to play next video
    const playNextVideo = (currentIndex) => {
      const nextIndex = (currentIndex + 1) % videos.length;
      setActiveVideoIndex(nextIndex);
      
      // Stop current video
      if (playersInstances.current[currentIndex]) {
        playersInstances.current[currentIndex].stopVideo();
      }
      
      // Play next video
      if (playersInstances.current[nextIndex]) {
        playersInstances.current[nextIndex].playVideo();
      }
    };

    // Initialize players when API is ready
    window.onYouTubeIframeAPIReady = () => {
      videos.forEach((video, index) => {
        if (playerRefs.current[index]) {
          const player = new window.YT.Player(`youtube-player-${index}`, {
            videoId: video.videoId,
            playerVars: {
              autoplay: index === 0 ? 1 : 0,
              mute: 1,
              controls: 0,
              loop: 0,
              playsinline: 1,
              rel: 0,
              modestbranding: 1,
            },
            events: {
              onReady: (event) => {
                if (index === 0) {
                  event.target.playVideo();
                }
              },
              onStateChange: (event) => {
                // When video ends (state 0), play next video
                if (event.data === window.YT.PlayerState.ENDED) {
                  playNextVideo(index);
                }
              },
            },
          });
          playersInstances.current[index] = player;
        }
      });
    };
  }, [videos]);

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
    return null;
  }

  return (
    <section className="tp-youtube-area pb-40 pt-40 pr-50 pl-50 mr-50 ml-50" >
      <div className="container-fluid px-4">
        <div className="row">
          <div className="col-12">
            <Swiper
              modules={[Navigation]}
              spaceBetween={3}
              slidesPerView={2}
              navigation={true}
              onSlideChange={(swiper) => setActiveVideoIndex(swiper.activeIndex)}
              breakpoints={{
                480: {
                  slidesPerView: 3,
                },
                768: {
                  slidesPerView: 4,
                },
                1024: {
                  slidesPerView: 5,
                },
                1280: {
                  slidesPerView: 6,
                },
                1536: {
                  slidesPerView: 7,
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
          width: 100%;
          height: 100%;
          border: none;
        }
        
        @media (max-width: 480px) {
          .youtube-reel-player {
            width: 160px;
            height: 285px;
          }
        }
      `}</style>
    </section>
  );
};

export default YouTubeVideosSlider;
