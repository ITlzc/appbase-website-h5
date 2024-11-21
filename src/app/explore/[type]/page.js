"use client";

import '../../styles/more.scss'
import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';
import { Spin } from 'antd';

import {
    recentUpdate,
    exploreAppData,
    getCategorys,
    searchData,
} from '../../../lib/ton_supabase_api'
import Footer from '@/app/components/Footer';

export default function MoreApps({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cId = searchParams.get('category_id');

    const [loading, set_loading] = useState(false);


    const unwrappedParams = use(params); // 解包 params
    // console.log('unwrappedParams = ',unwrappedParams)
    const type = unwrappedParams.type

    const [apps, set_apps] = useState([]);
    const [categorys, set_categorys] = useState([]);
    const [select_category, set_select_category] = useState({});
    const [currentCategory, setCurrentCategory] = useState('All')

    const [page, set_page] = useState(1)
    const [size, set_size] = useState(6)

    const [show_more_image, set_show_more_image] = useState(false)

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
        if (new_apps && new_apps.length) {
            set_page(page)
        }
        new_apps.map(app => {
            deal_app(app)
        })
        let temp = apps
        temp = temp.concat(new_apps)
        set_apps(temp)
        console.log('fetchRecentApps recent_apps =', recent_apps)

    }

    const fetchExploreApps = async (page, size, filter) => {
        set_loading(true)
        let temp_apps = await exploreAppData(page, size, filter)
        set_loading(false)
        console.log('fetchExploreApps =', temp_apps)
        if (temp_apps && temp_apps.length) {
            set_page(page)
        }
        temp_apps.map(app => {
            deal_app(app)
        })
        let temp = apps
        temp = temp.concat(temp_apps)
        set_apps(temp)
    }

    useEffect(() => {
        console.log('useEffect apps in = ', page, apps, select_category)
        if (apps.length >= select_category.count) {
            set_show_more_image(false)
        } else {
            set_show_more_image(true)
        }
        console.log('useEffect apps out = ', page, apps, select_category)
    }, [apps])

    const fetchCategorys = async () => {
        set_loading(true)
        let category = await getCategorys()
        set_loading(false)
        if (cId && cId.length) {
            category.map(item => {
                if (item.category_id == cId) {
                    set_select_category(item)
                    setCurrentCategory(item.name)
                }
            })
        } else {
            let category_temp = category[0]
            set_select_category(category_temp)
            setCurrentCategory(category_temp.name)
        }
        console.log('fetchCategorys =', category)
        set_categorys(category)
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

    const init_data = async () => {
        fetchCategorys()
        // if (type === 1) {
        //     fetchRecentApps(page, size)
        // } else {
        //     fetchExploreApps(page, size)
        // }
    }

    const reset_page = (category) => {
        console.log('reset_page in')
        return new Promise((resolve, reject) => {
            if (category && category.category_id && category.category_id.length) {
                set_select_category(category)
                setCurrentCategory(category.name)
            } else {
                set_select_category({})
            }
            set_page(1)
            set_apps([])
            console.log('reset_page out')
            resolve(null)
        })
    }

    let is_init = true
    useEffect(() => {
        console.log('useEffect page in = ', page, apps, select_category, is_init)
        if (!select_category.hasOwnProperty('category_id')) {
            return
        }
        // if (cId && cId.length && !(select_category && select_category.category_id)) {
        //     return
        // }
        // if (!is_init) {
        let category_id = select_category && select_category.category_id && select_category.category_id.length ? select_category.category_id : null
        if (type === 1) {
            fetchRecentApps(page, size, {
                category_id: category_id
            })
        } else {
            fetchExploreApps(page, size, {
                category_id: category_id
            })
        }
        // }
        is_init = false
        console.log('useEffect page out = ', page, apps, select_category, is_init)
    }, [select_category])

    const switch_category = async (category) => {
        console.log('switch_category in')
        set_page(1)
        set_apps([])
        set_select_category(category)
        setCurrentCategory(category.name)
        // if (category && category.category_id && category.category_id.length) {
        //     set_select_category(category)
        //     setCurrentCategory(category.name)
        // } else {
        //     set_select_category({})
        // }
        // console.log('switch_category page = ',page,apps)
        // if (type === 1) {
        //     fetchRecentApps(page, size,{
        //         category_id:category && category.category_id && category.category_id.length ? category.category_id : null
        //     })
        // } else {
        //     fetchExploreApps(page, size,{
        //         category_id:category && category.category_id && category.category_id.length ? category.category_id : null
        //     })
        // }
    }

    const get_apps = () => {
        let page_temp = page + 1
        let filter = {
            category_id: select_category && select_category.category_id && select_category.category_id.length ? select_category.category_id : null
        }
        if (type === 1) {
            fetchRecentApps(page_temp, size, filter)
        } else {
            fetchExploreApps(page_temp, size, filter)
        }
    }

    useEffect(() => {
        console.log('useEffect in')
        init_data()
        console.log('useEffect out')
    }, [])

    return (
        <Spin size="large" spinning={loading}>
            <div className="explore flex-col">

                <div className="box_13 flex-row">
                    <div className="group_22 flex-col">
                        <Header />
                        <div className="text-wrapper_18 flex-row">
                            <span className="text_4">{type == 1 ? 'Recent Apps' : 'Explore Apps'}</span>
                        </div>
                        <div className="text-wrapper_19 flex-row">
                            <span className="text_5">Discover more applications and receive rewards</span>
                        </div>
                        <div className="box_15 flex-row flex-wrap justify-start">
                            {
                                categorys.map(cate => {
                                    return (
                                        <div key={cate.category_id} className={`group_10 flex-col justify-center cursor-pointer ${cate.name === currentCategory ? 'category_active' : ''}`} onClick={() => switch_category(cate)}>
                                            <div className="text-wrapper_9">
                                                <span className="text_36">{cate.name}</span>
                                                <span className="text_37"> </span>
                                                <span className="text_38">{cate.count}</span>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className="box_16 flex-row flex-wrap justify-between">
                            {
                                apps.map(app => {
                                    return (
                                        <div className="section_1 flex-col" key={app.id} onClick={() => to_detail(app)}>
                                            <div className="box_17 flex-row justify-between">
                                                <img
                                                    className="image_2"
                                                    src={app.show_icon}
                                                />
                                                <div className="text-wrapper_20 flex-col">
                                                    <span className="text_24">{app.name}</span>
                                                    <span className="text_25">{app.caption}</span>
                                                </div>
                                            </div>
                                            <div className="box_18 flex-row justify-between">
                                                <div className="flex-row align-center">
                                                    <img src="/images/exploreIcon.png" alt="" />
                                                    <span className="text_26">+{app.points / 1000000} points</span>

                                                </div>
                                                <div className="text-wrapper_12 flex-col justify-center align-center cursor-pointer" onClick={() => to_detail(app)}>
                                                    <span className="text_27">OPEN</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        {
                            show_more_image && <div className="image-wrapper_3 flex-row cursor-pointer" onClick={() => get_apps()}>
                                <img
                                    className="label_2"
                                    src={"/images/arrow-bottom.png"}
                                />
                            </div>
                        }

                    </div>
                </div>
                <Footer />

            </div>
        </Spin>
    );
}