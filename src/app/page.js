
"use client";
import './styles/home.scss'
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

import {
  getRewardCount,
  recentUpdate,
  recommandData,
  getCategorys,
  exploreAppDataFromCache,
  recommandDataFromCache,
  taskCountFromCache,
  recommandTotal
} from '../lib/ton_supabase_api'
import Header from './components/Header';
import Link from 'next/link';
import Carousel from './components/Carousel';
import Footer from "./components/Footer";
import { Spin } from 'antd';


function HomeComponent() {

  const router = useRouter();

  const [appData, setAppData] = useState([]);
  const [loading, set_loading] = useState(false);

  const [reward, set_reward] = useState({});
  const [recent_apps, set_recent_apps] = useState([]);
  const [recommand_apps, set_recommand_apps] = useState([]);
  const [explore_apps, set_explore_apps] = useState([]);
  const [categorys, set_categorys] = useState([]);

  const [currentCategory, setCurrentCategory] = useState('All')



  const [page, set_page] = useState(1)
  const [size, set_size] = useState(3)

  const [recommand_page, set_recommand_page] = useState(1)
  const [recommand_size, set_recommand_size] = useState(3)


  const fetchReward = async () => {
    set_loading(true)
    let temp_reward = await getRewardCount()
    let task_count = await taskCountFromCache()
    temp_reward.rewardTaskCount = task_count.total_count
    set_loading(false)
    console.log('fetchReward =', temp_reward,task_count)
    set_reward(temp_reward)
  }

  const deal_app = (app) => {
    if (app.icon) {
      app.show_icon = app.icon.url
      if (app.show_icon.indexOf('http') < 0) {
        app.show_icon = 'https://jokqrcagutpmvpilhcfq.supabase.co/storage/v1/object/public' + app.show_icon
      }
    }
  }

  const fetchRecentApps = async (page, size) => {
    set_loading(true)
    let new_apps = await recentUpdate(page, size)
    set_loading(false)
    console.log('fetchRecentApps =', new_apps)
    new_apps.map(app => {
      deal_app(app)
    })
    set_recent_apps(new_apps)
    console.log('fetchRecentApps recent_apps =', recent_apps)

  }

  const fetchRecommandApps = async (page, size) => {
    console.log('fetchRecommandApps in = ', page, size)
    set_loading(true)
    let data = await recommandDataFromCache(page)
    let apps = data.apps
    let total = data.total_count
    // let apps = await recommandData(page, size)
    // let total = await recommandTotal()
    set_loading(false)
    console.log('fetchRecommandApps =', apps)
    if (apps && apps.length) {
      let temp = Math.ceil(total / 3) 
      if (temp == page) {
        page = 0
      }
      console.log('fetchRecommandApps page =', page,temp)
      set_recommand_page(page)
    }
    apps.map(app => {
      deal_app(app)
    })
    set_recommand_apps(apps)
  }

  const fetchExploreApps = async (page, size, filter) => {
    set_loading(true)
    let category_id = 'app_all'
    if (filter && filter.category_id && filter.category_id.length) {
      category_id = filter.category_id
    }
    let data = await exploreAppDataFromCache(category_id,page)
    let apps = data.apps
    set_loading(false)
    console.log('fetchExploreApps =', apps)
    apps.map(app => {
      deal_app(app)
    })
    set_explore_apps(apps)
  }

  const fetchCategorys = async () => {
    set_loading(true)
    let category = await getCategorys()
    set_loading(false)
    console.log('fetchCategorys =', category)
    set_categorys(category)
  }

  const to_mini_app = () => {
    router.push(`/explore_apps`);
  }

  const more_app = async (type) => {
    console.log('more_app in = ', type)
    router.push(`/explore/${type}`);
  }

  const to_detail = async (app) => {
    console.log('to_detail in = ', app)
    if (app.is_forward) {
      open_app(app)
      return
    }
    const app_id = app.id
    router.push(`/apps/${app_id}`);
  }

  const open_app = async (app) => {
    console.log('open_app in = ', app)
    if (app.link && app.link.length && app.link !== 'https://') {
      window.open(app.link)
    }
  }

  const switch_recommend = () => {
    console.log('switch_recommend in')
    let page = recommand_page + 1
    fetchRecommandApps(page, recommand_size)
  }

  const switch_category = (category) => {
    console.log('switch_category in', category)
    setCurrentCategory(category.name)
    set_page(1)
    fetchExploreApps(page, size, {
      category_id: category && category.category_id && category.category_id.length ? category.category_id : null
    })
  }

  const init_data = async () => {
    fetchCategorys()
    fetchReward()
    fetchRecentApps()

    fetchRecommandApps(recommand_page, recommand_size)

    fetchExploreApps(page, size)
  }
  useEffect(() => {
    console.log('useEffect in')
    init_data()
    console.log('useEffect out')
  }, [])

  return (
    <Spin size="large" spinning={loading}>
      <div className="home flex-col">
        <Header />
        <div className="section_1 flex-col">
          <img className='banner' src="/images/bannerBg.png" alt="" />
          <img className='homeIcon' src="/images/homeIcon.png" alt="" />

          <div className="box_1 flex-col">
            <div className="homeApps flex-col justify-center align-center">
              <p className='p1'>Explore Apps</p>
              <p className='p2'>Enjoy exciting app experiences and generous rewards</p>

              <div className="num-block flex-row justify-center align-center">
                <div className="flex-row align-center">
                  <span className='span1'>Reward App</span>
                  <span className='span2'>{reward.rewardAppCount}</span>
                </div>

                <div className="line"></div>

                <div className="flex-row align-center">
                  <span className='span1'>Reward Tasks</span>
                  <span className='span2'>{reward.rewardTaskCount}</span>
                </div>
              </div>

              <a className="exBtn flex-row justify-center align-center" href='https://t.me/AppBaseBot/app' target='_blank' >Explore AppBase Miniapp</a>
            </div>
            <Carousel />

            <div className="group_2 flex-col">
              <div className="section_7 flex-row justify-between">
                <span className="text_10">Recent Updates</span>

                <img
                  onClick={() => more_app(1)}
                  className="label_2"
                  src={"/images/more.svg"}
                />
              </div>
              <div className="section_8 flex-col">
                {
                  recent_apps.map(app => {
                    return (
                      <div key={app.id} className="block_3 flex-row" onClick={() => to_detail(app)}>
                        <img
                          className="image_4"
                          src={app.show_icon}
                        />
                        <div className="text-group_17 flex-col justify-start">
                          <span className="text_11">{app.name}</span>
                          <span className="text_12 flex-wrap">
                            {app.caption}
                          </span>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>


            <div className="box_4 flex-row justify-between">
              <div className="text-group_2 flex-col justify-between">
                <span className="text_2">Recommend</span>
                <span className="text_3">Open the Apps to receive rewards</span>
              </div>
              <div className="image-wrapper_2 flex-col cursor-pointer" onClick={() => switch_recommend()}>
                <img
                  className="label_3"
                  src={"/images/load.svg"}
                />
              </div>
            </div>
            <div className="box_5 flex-col justify-between">
              {
                recommand_apps.map(app => {
                  return (
                    <div className="box_6 flex-col" key={app.id} onClick={() => to_detail(app)}>
                      <div className="image-text_2 flex-row justify-between">
                        <img
                          className="image_3"
                          src={app.show_icon}
                        />
                        <div className="text-group_3 flex-col justify-between">
                          <span className="text_4">{app.name}</span>
                          <span className="text_5">{app.caption}</span>
                        </div>
                      </div>
                      <div className="group_1 flex-row justify-between">
                        <div className="image-text_3 flex-row justify-start align-center">
                          <img
                            className="label_4"
                            src={"/images/recommendIcon.png"}
                          />
                          <span className="text-group_4">+{app.points / 1000000} points</span>
                        </div>
                        <div className={`text-wrapper_1 flex-col align-center justify-center`} onClick={() => to_detail(app)}>
                          <span className="text_6">OPEN</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              }

            </div>
          </div>
          <div className="box_11">
            <div className="box_11 flex-col">
              <div className="box_12 flex-row justify-between">
                <div className="text-group_8 flex-col justify-between">
                  <span className="text_13">Explore Apps</span>
                  <span className="text_14">Discover more applications and receive rewards</span>
                </div>
              </div>
              <div className="box_13 flex-row flex-row flex-wrap justify-start">
                {
                  categorys.map(cate => {
                    return (
                      <div className={`group_3 flex-col justify-center ${cate.name === currentCategory ? 'category_active' : ''}`} key={cate.category_id} onClick={() => switch_category(cate)}>
                        <div className="text-wrapper_4 justify-center align-center">
                          <span className="text_15">{cate.name}</span>
                          <span className="text_17">{cate.count}</span>
                        </div>
                      </div>
                    )
                  })
                }
              </div>


              <div className="box_15 flex-col justify-between">
                {
                  explore_apps.map(app => {
                    return (
                      <div className="section_2 flex-col" key={app.id} onClick={() => to_detail(app)}>
                        <div className="box_16 flex-row justify-between">
                          <img
                            className="image_6"
                            src={app.show_icon}
                          />
                          <div className="text-wrapper_10 flex-col justify-between">
                            <span className="text_33">{app.name}</span>
                            <span className="text_34">{app.caption}</span>
                          </div>
                        </div>
                        <div className="box_17 flex-row justify-between">
                          <div className="image-text_6 flex-row justify-start align-center">
                            <img
                              className="label_7"
                              src={"/images/exploreIcon.png"}
                            />
                            <span className="text-group_9">+{app.points / 1000000}</span>
                          </div>
                          <div className={`text-wrapper_11 flex-col justify-center align-center`} onClick={() => to_detail(app)}>
                            <span className="text_35">OPEN</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
              <img
                className="label_9" onClick={() => more_app(2)}
                src={"/images/arrow-bottom-white.png"}
              />
            </div>

            <div className="box_11 flex-col">
              <div className="about" id='about'>
                <span className='tit'>About The Product</span>
                <Link target='_blank' href={'https://docs.google.com/document/d/19nKm4ZPkiq56Fvqv5RYOlDCsEVGte41kd838IEOa7H8/edit?usp=sharing'} className='item flex-row justify-between align-center'>
                  <span>Privacy</span>
                  <img src="/images/arrow-right.png" alt="" />
                </Link>

                <Link target='_blank' href={'https://docs.google.com/document/d/1Brc4RdM87qH9jVAPPvdBwQUouuabg7Mci2jd3XzrRBs/edit?usp=sharing'} className='item flex-row justify-between align-center'>
                  <span>Terms</span>
                  <img src="/images/arrow-right.png" alt="" />
                </Link>

                <p className='item flex-row justify-between align-center'>
                  <span>Copyright</span>
                  <img src="/images/arrow-right.png" alt="" />
                </p>
              </div>


              <Footer />
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeComponent />
    </Suspense>
  );
}