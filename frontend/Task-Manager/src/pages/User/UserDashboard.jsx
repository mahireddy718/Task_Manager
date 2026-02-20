import React, { useContext, useEffect, useState } from "react";
import { useUserAuth } from "../../hooks/useUserAuth.jsx";
import { UserContext } from "../../context/userContext.jsx";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import moment from "moment";
import { LuListChecks } from "react-icons/lu";
import InfoCard from "../../components/Cards/InfoCard.jsx";
import { addThousandsSeparator } from "../../utils/helper.js";
import TaskListTable from "../../components/layouts/TaskListTable.jsx";
import { LuArrowRight } from "react-icons/lu";
import CustomPieChart from "../../components/Charts/CustomPieChart.jsx";
import CustomBarChart from "../../components/Charts/CustomBarChart.jsx";

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

const UserDashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  // Prepare Chart Data
  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || null;
    const taskPriorityLevels = data?.taskPriorityLevels || null;

    const taskDistributionData = [
      { status: "Pending", count: taskDistribution?.Pending || 0 },
      { status: "In-Progress", count: taskDistribution?.["In-Progress"] || 0 },
      { status: "Completed", count: taskDistribution?.Completed || 0 },
    ];

    setPieChartData(taskDistributionData);

    const priorityLevelData = [
      { priority: "Low", count: taskPriorityLevels?.Low || 0 },
      { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
      { priority: "High", count: taskPriorityLevels?.High || 0 },
    ];
    setBarChartData(priorityLevelData);
  };

  const getUserDashboardData = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_USER_DASHBOARD_DATA
      );

      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts || null);
      }
    } catch (error) {
      console.error("Error fetching user dashboard data", error);
    }
  };

  useEffect(() => {
    getUserDashboardData();
    return () => {};
  }, []);

  const onSeeMore = () => {
    navigate("/user/my-tasks");
  };

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <div>
          <div className="col-span-3">
            <h2 className="text-xl md:text-2xl">
              Good Morning! {user?.name}
            </h2>
            <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
              {moment().format("dddd Do MMM YYYY")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
          <InfoCard
            label="Total Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.All || 0
            )}
            color="bg-primary"
          />
          <InfoCard
            label="Pending Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Pending || 0
            )}
            color="bg-orange"
          />
          <InfoCard
            label="Completed Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Completed || 0
            )}
            color="bg-green"
          />
          <InfoCard
            label="In-Progress"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.InProgress || 0
            )}
            color="bg-cyan"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 my-8">
        <div className="card p-3">
          <div className="h-min lg:h-80">
            <h3 className="text-lg font-medium mb-4">Task Distribution</h3>
            <CustomPieChart data={pieChartData} />
          </div>
        </div>

        <div className="card p-3">
          <div className="h-min lg:h-80">
            <h3 className="text-lg font-medium mb-4">Task Priority Levels</h3>
            <CustomBarChart data={barChartData} />
          </div>
        </div>
      </div>

      <div className="card my-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <LuListChecks className="text-xl" />
            <h3 className="text-lg font-medium">Recent Tasks</h3>
          </div>
          {dashboardData?.recentTasks?.length > 0 && (
            <button
              className="flex items-center gap-1 text-primary hover:underline"
              onClick={onSeeMore}
            >
              See More <LuArrowRight />
            </button>
          )}
        </div>
        {dashboardData?.recentTasks?.length > 0 ? (
          <TaskListTable tableData={dashboardData.recentTasks} />
        ) : (
          <p className="text-gray-400 text-center py-6">No tasks available</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;