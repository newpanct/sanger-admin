import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { adminLogout } from "../server/api"; 

// 超时时间，30 分钟
const TIMEOUT = 30 * 60 * 1000; 

export const useIdleLogout = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // 登出操作
  const handleLogout = () => {
    adminLogout(); 
    message.info("长时间未操作，已自动登出");
    navigate("/login");
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, TIMEOUT);
  };

  useEffect(() => {
    // 监听用户操作事件
    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      // 清理事件监听器和定时器
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

};
