const SUPABASE = require("@supabase/supabase-js");

const supabaseUrl = "https://jokqrcagutpmvpilhcfq.supabase.co";
const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impva3FyY2FndXRwbXZwaWxoY2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwNDc2MjEsImV4cCI6MjA0MTYyMzYyMX0.ASxFtj2hYVeT7G00arDoNS9zLy8BzdgsSPFRYJw-62E";
const supabase = SUPABASE.createClient(supabaseUrl, supabaseKey);

// Explore

// 获取公告
export async function getAnnouncement() {
	let { data: announcement, error: announcementError } = await supabase
		.from("announcement")
		.select("comment")
		.order("updated_at", { ascending: false })
		.limit(0, 1);
	if (announcementError) {
		throw announcementError;
	}
	return announcement.length == 0 ? "" : announcement[0].comment;
}

// 获取轮播图
export async function getSlideshow() {
	let { data: slideshow, error: slideshowError } = await supabase
		.from("slideshow")
		.select("id,app_id,image_link")
		.order("update_at", { ascending: false });
		console.log('getSlideshow = ',slideshow,slideshowError)
	if (slideshowError) {
		return [];
	}
	return slideshow;
}

// 获取  奖励app数量 和 奖励task数量
export async function getRewardCount() {
	let res = {
	  rewardAppCount: 0,
	  rewardTaskCount: 0,
	};
	let {
	  data: appData,
	  error: appError,
	  count: appCount,
	} = await supabase
	  .from("app")
	  .select("id", { count: "exact", head: true })
	  .neq("points", 0);
	res.rewardAppCount = appCount;
	let {
	  data: taskData,
	  error: taskError,
	  count: taskCount,
	} = await supabase
	  .from("task")
	  .select("id", { count: "exact", head: true })
	  .neq("points", 0);
	res.rewardTaskCount = taskCount;
	return res;
  }

// 指定数量 最近更新的app
export async function recentUpdate(page,size,filter) {
	page = page ? page : 1
    size = size ? size : 6
    let offset = (page - 1) * size
    size = offset + size - 1

	let select = supabase
	.from("app")
	.select("id,name,icon,description,caption,is_forward")
	.is('deleted', false)
	if (filter && filter.category_id && filter.category_id.length) {
		select = select.eq('category_id', filter.category_id)
	}
	select = select.order("updated_at", { ascending: false })
	let { data, error } = await select.range(offset, size)

	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	return data;
}

// 指定数量 推荐APP的数据
export async function recommandData(page,size) {
	page = page ? page : 1
    size = size ? size : 3
    let offset = (page - 1) * size
    size = offset + size - 1
	console.log('recommandData = ',offset,size)
	let { data, error } = await supabase
	.from("app")
	.select("id,name,icon,description,points,category_id,link,images,appPlatforms,caption,is_forward")
	.is('deleted', false)
	.order("recommend", { ascending: false })
	.order("id", { ascending: false })
	.range(offset, size)
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	return data;
}

// APP的分类
// export async function getCategorys() {
// 	let res = [];
// 	const { data: appTotal, count:appTotalCount, error: appError } = await supabase
// 		.from("app")
// 		.select("*", { count: "exact",head: true });
// 	if (appError) {
// 		console.error("查询错误:", appError);
// 	}
// 	res.push({ name: "All", category_id: "", count: appTotalCount });
// 	const { data: categoryData, error: categoryError } = await supabase
// 		.from("category")
// 		.select("id,title");
// 	if (categoryError) {
// 		console.error("查询错误:", categoryError);
// 	}
// 	let promise = []
// 	for (const category of categoryData) {
// 		let p = new Promise(async (resolve, reject) => {
// 			const { count: categoryCount, error } = await supabase
// 			.from("app")
// 			.select("*", { count: "exact" }) // 获取总数
// 			.eq("category_id", category.id);
// 			if (error) {
// 				resolve({
// 					category_id: category.id,
// 					name: category.title,
// 					count: 0
// 				})
// 				return
// 			}
// 			resolve({
// 				category_id: category.id,
// 				name: category.title,
// 				count: categoryCount
// 			})
// 		})
// 		promise.push(p)
// 	}
// 	let temp = await Promise.all(promise)
// 	res = res.concat(temp)
// 	return res
// }

export async function getCategorys() {
	let res = [];
	const { data: categoryData, error: categoryError } = await supabase
	  .from("category")
	  .select("id,title,countApps");
	if (categoryError) {
	  console.error("查询错误:", categoryError);
	}
	let appTotalCount = 0;
	for (const category of categoryData) {
	  appTotalCount += category.countApps;
	  res.push({
		name: category.title,
		category_id: category.id,
		count: category.countApps,
	  });
	}
	res.unshift({ name: "All", category_id: "", count: appTotalCount });
	return res
  }

// 搜索数据
export async function searchData(name) {
	// console.log('searchData in =',name)
	const searchTerm = `${name}%`; // 匹配以 A 开头的 name
	const { data: searchData, error } = await supabase
		.from("app")
		.select("id, name, icon, description,link,images,appPlatforms,caption,points,is_forward")
		.like("name", searchTerm); // 使用 ilike 实现模糊查询
	// console.log('searchData searchData =',searchData,error)
	if (error) {
		console.error("Error fetching data:", error);
		return [];
	}
	return searchData;
}

// 每个类别的数据
export async function exploreAppData(page,size,filter) {
	page = page ? page : 1
    size = size ? size : 6
    let offset = (page - 1) * size
    size = offset + size - 1
	let select = supabase
	.from("app")
	.select("id,name,icon,description,points,link,images,appPlatforms,caption,is_forward")
	.is('deleted', false)
	if (filter && filter.category_id && filter.category_id.length) {
		select = select.eq('category_id', filter.category_id)
	}
	select = select.order("updated_at", { ascending: false })
	let { data, error } = await select.range(offset, size)
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	return data;
}
/**
 * 用户是否登录。
 *
 * @returns {string} 返回值 为 当前登录用户的session。
 */ 
export async function islogin() {
	// const { data:temp_user,error:user_error } = await supabase.auth.getUser()
	// if (user_error) {
	// 	throw user_error
	// }
	// console.log('islogin =',temp_user)
	const { data, error } = await supabase.auth.getSession()
	if (error) {
	  throw error
	}
	// console.log("data.session = ",data)
	let user = data && data.session && data.session.user
	if (user) {
	  let { data } = await supabase.from("user").select("*").eq('id',user.id)
	  let profiles = data && data.length && data[0]
	  user.profiles = profiles
	//   localStorage.setItem('user_id',user.id)
	} else {
		// localStorage.removeItem('user_id')
	}

	return user
}

/**
 * 用户登录。
 *
 * @param {string} inviter - 邀请者id，可以为空。
 * @returns {string} 返回值 为 当前登录用户的session。
 */
export async function login(inviter,tg_user_info) {
	const { data, error } = await supabase.auth.signInAnonymously({
		options:{
			data:{
				inviter_id:inviter,
				name: tg_user_info && (tg_user_info.username || ((tg_user_info.first_name || '') + (tg_user_info.last_name || ''))), 
				avatar:tg_user_info && tg_user_info.photo_url
			}
		}
	})
	// console.log('login data =',data)
	if (error) {
	  throw error
	}
	if (!data.session) {
	  throw new Error('login error,no session found')
	}
	let user =  data && data.session && data.session.user
	if (user) {
		let { data } = await supabase.from("user").select("*").eq('id',user.id)
		let profiles = data && data.length && data[0]
		user.profiles = profiles
		// localStorage.setItem('user_id',user.id)
	}
	
	if (isTelegramMiniAPP()) {
		cloud_save_session(data.session)
		let linked = await islinkTelegram()
		if (!linked) {
			await linkTelegramMiniAPP()
		}
	}
	return user
}
// app的信息数据
export async function getApp(app_id) {
	console.log('getApp in = ',app_id)
	let user = await islogin()
	let select = supabase
	.from("app")
	.select(
		"id,name,is_forward,icon,description,points,category_id,link,images,appPlatforms,caption,ranking_in_category,rating,category(title)"
	)
	.eq("id", app_id)
	if (user) {
		select = supabase
		.from("app")
		.select(
			"id,name,is_forward,icon,description,points,category_id,link,images,appPlatforms,caption,ranking_in_category,rating,category(title),user_app(*)"
		)
		.eq("id", app_id)
		.eq('user_app.user_id',user.id)
	}
	let { data: appInfo, error } = await select
		.order("recommend", { ascending: false })
		.single();
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	console.log('getApp appInfo = ',appInfo)
	// appInfo.grade = 0;
	appInfo.reviews = 0;
	// // 查询app_id在category_id分类下的排名
	// const { data: appRankData, error: appRankError } = await supabase
	// 	.from("app")
	// 	.select("id, rating")
	// 	.eq("category_id", appInfo.category_id) // 按 category_id 过滤
	// 	.order("rating", { ascending: false }) // 按 rank 降序排列
	// 	.order('updated_at',{ ascending: false })

	// if (appRankError) {
	// 	console.error("查询错误:", appRankError);
	// 	return;
	// }
	// // 找到 app_id 的排名
	// const rankPosition = appRankData.findIndex((app) => app.id === app_id) + 1; // 数组下标 + 1 为排名
	// console.log(
	// 	`app_id 为 ${app_id} 在 category_id 为 ${appInfo.category_id} 下的排名为: 第 ${rankPosition} 名`
	// );
	// appInfo.rank = rankPosition;

	const {count,error: reviewsError } = await supabase
		.from("user_reviews")
		.select("score", { count: "exact" ,head:true}) // 使用 count 选项获取总条数
		.eq("app_id", app_id);
	if (reviewsError) {
		console.error("查询错误:", error);
	}
	appInfo.reviews_count = count
	// else {
	// 	const totalReviews = reviews.length;
	// 	const avgScore =
	// 		reviews.reduce((sum, review) => sum + review.score, 0) / totalReviews;
	// 	console.log(`总评论数: ${totalReviews}`);
	// 	console.log(`平均评分: ${avgScore.toFixed(2)}`);
	// 	appInfo.grade = totalReviews;
	// 	appInfo.reviews = avgScore.toFixed(2);
	// }
	return appInfo;
}

// MiniAPP

// points_type : 1-app   2-task   3-invite
export const AppPointsEnum = {
	app: 1,
	task: 2,
	invite: 3,
};

export const UserAppStatusEnum = {
	open: 1,
	verify: 2,
};

export async function appRecommandData(recommendAppCount) {
	let res = [];
	let { data: recommandData, error } = await supabase
		.from("app")
		.select("id,name,icon,description,points")
		.order("recommend", { ascending: false })
		.limit(0, recommendAppCount);
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	console.log("Fetched data:", data);
	for (const app of recommandData) {
		let earnRewardTime,
			status = await checkIsEarnAppReward(app.id, AppPointsEnum["app"]);
		let resp = {
			name: app.name,
			icon: app.icon,
			description: app.description,
			points: app.points,
			earnRewardTime: earnRewardTime,
			status: status,
		};
		res.push(resp);
	}
	return res;
}

export async function appGetCategorys() {
	let res = [];
	const { data: appTotalCount, error: appError } = await supabase
		.from("app")
		.select("*", { count: "exact" });
	if (appError) {
		console.error("查询错误:", appError);
	}
	res.push({ name: "All", category_id: "", count: appTotalCount });
	const { data: categoryData, error: categoryError } = await supabase
		.from("category")
		.select("id,title");
	if (categoryError) {
		console.error("查询错误:", categoryError);
	}
	for (const category of categoryData) {
		const { count: categoryCount, error } = await supabase
			.from("app")
			.select("*", { count: "exact" }) // 获取总数
			.eq("category_id", category.id);
		res.push({
			name: category.title,
			category_id: category.id,
			count: categoryCount,
		});
	}
}

export async function appExploreAppData(category_id, limitCount) {
	let res = [];
	let recommandDataArr = [];
	if (category_id == "") {
		let { data: recommandData, error } = await supabase
			.from("app")
			.select("id,name,icon,description,points")
			.order("updated_at", { ascending: false })
			.limit(0, limitCount);
		if (error) {
			console.error("Error fetching data:", error);
			return;
		}
		recommandDataArr = recommandData;
	} else {
		let { data: recommandData, error } = await supabase
			.from("app")
			.select("id,name,icon,description,points")
			.order("updated_at", { ascending: false })
			.eq("category_id", category_id)
			.limit(0, limitCount);
		if (error) {
			console.error("Error fetching data:", error);
			return;
		}
		recommandDataArr = recommandData;
	}
	// 示例：将数据渲染到页面上
	for (const app of recommandDataArr) {
		let earnRewardTime,
			status = await checkIsEarnAppReward(app.id, AppPointsEnum["app"]);
		let resp = {
			name: app.name,
			icon: app.icon,
			description: app.description,
			points: app.points,
			earnRewardTime: earnRewardTime,
			status: status,
		};
		res.push(resp);
	}
	return res;
}

export async function getAppInfo(app_id, user_id) {
	let { data: appInfo, error } = await supabase
		.from("app")
		.select(
			"id,name,icon,description,points,category_id,link,images,appPlatforms"
		)
		.order("recommend", { ascending: false })
		.eq("id", app_id)
		.single();
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	appInfo.grade = 0;
	appInfo.reviews = 0;
	// 查询app_id在category_id分类下的排名
	const { data: appRankData, error: appRankError } = await supabase
		.from("app")
		.select("id, rank")
		.eq("category_id", category_id) // 按 category_id 过滤
		.order("rank", { ascending: false }); // 按 rank 降序排列

	if (appRankError) {
		console.error("查询错误:", error);
		return;
	}
	// 找到 app_id 的排名
	const rankPosition = appRankData.findIndex((app) => app.id === app_id) + 1; // 数组下标 + 1 为排名
	console.log(
		`app_id 为 ${app_id} 在 category_id 为 ${category_id} 下的排名为: 第 ${rankPosition} 名`
	);
	appInfo.rank = rankPosition;

	const { data: reviews, error: reviewsError } = await supabase
		.from("user_reviews")
		.select("score", { count: "exact" }) // 使用 count 选项获取总条数
		.eq("app_id", app_id);
	if (reviewsError) {
		console.error("查询错误:", error);
	} else if (reviews.length === 0) {
		console.log("not found reviews");
	} else {
		const totalReviews = reviews.length;
		const avgScore =
			reviews.reduce((sum, review) => sum + review.score, 0) / totalReviews;
		console.log(`总评论数: ${totalReviews}`);
		console.log(`平均评分: ${avgScore.toFixed(2)}`);
		appInfo.grade = totalReviews;
		appInfo.reviews = avgScore.toFixed(2);
	}
	let earnTime,
		status = await checkIsEarnAppReward(app_id, AppPointsEnum["app"], user_id);
	return appInfo;
}

export async function getTask() {
	let { data: taskInfo, error } = await supabase
		.from("task")
		.select("id,name,icon,points")
		.order("updated_at", { ascending: false });
	return taskInfo;
}

// points_type : 1-app   2-task   3-invite
export async function checkIsEarnAppReward(appId, points_type, userId) {
	let { data: recordData, error } = await supabase
		.from("user_point_record")
		.select("")
		.eq("source_id", appId)
		.eq("points_type", points_type)
		.order("created_at", { ascending: false });
	if (error) {
		console.log("Get app earn reward record data error:", error);
		throw error;
	}
	if (recordData && recordData.length == 0) {
		return 0;
	}
	let plus24HourTimestamp = convertTimestamptzToUnixPlus24Hours(
		recordData[0].created_at
	);
	let currentTimestamp = Date.now();
	let earnTime =
		plus24HourTimestamp > currentTimestamp ? plus24HourTimestamp : 0;
	let { data: userAppData, error: userAppError } = await supabase
		.from("user_app")
		.select("status")
		.eq("user_id", userId)
		.eq("app_id", appId)
		.order("updated_at", { ascending: false });
	let status = UserAppStatusEnum["open"];
	if (
		userAppData.length > 0 &&
		userAppData[0].status == UserAppStatusEnum["verify"]
	) {
		status = UserAppStatusEnum["verify"];
	}
	return earnTime, status;
}

function convertTimestamptzToUnixPlus24Hours(timestamptz) {
	// 将 ISO 字符串转换为 JavaScript Date 对象
	const date = new Date(timestamptz);

	// 获取当前的 Unix 时间戳（秒）
	let unixTimestamp = Math.floor(date.getTime() / 1000);

	// 推迟 24 小时（24 * 60 * 60 秒）
	const SECONDS_IN_A_DAY = 24 * 60 * 60;
	unixTimestamp += SECONDS_IN_A_DAY;

	return unixTimestamp;
}
