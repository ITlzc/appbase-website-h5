"use client";

import '../styles/explore.scss'

import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ExploreApps() {

  const router = useRouter();

  const back = () => {
    router.back()
  }

  return (
    <div className="explore_app flex-col">
      <div className="block_8 flex-row align-center cursor-pointer" onClick={back}>
        <img
          className="label_2"
          src={"/images/arrow-left-f.png"}
        />
        <span className="text_4">Back</span>
      </div>
      <div className="group_16 flex-col">
        <div className="text-group_5 flex-col justify-center align-center">
          <span className="text_5">Use the AppBase Miniapp</span>
          <span className="paragraph_1">
            Get more rewards and
            <br />
            explore interesting applications
          </span>
        </div>
        <img
          className="image_2"
          src={"/images/app.png"}
        />
        <img
          className="image_3"
          src={"/images/AppBase_QR.png"}
        />
        <div className="image-text_4 flex-row justify-between align-center">
          <img
            className="thumbnail_1"
            src={"/images/tg_.png"}
          />
          <span className="text-group_2">Scan QR code using Telegram</span>
        </div>
      </div>
      <Footer />
    </div>
  );
}