export const convertHHMMSSToDate = (timeString: string): Date => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    return date;
};

export const getTodayMidnight = (): Date => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

export const getDateISO = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

export const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const secondsLeft = totalSeconds % 3600;
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = Math.trunc(secondsLeft % 60);
    let formattedTime = "";

    if (hours > 0) {
        formattedTime += `${hours} hour${hours > 1 ? "s" : ""}`;
    }

    if (minutes > 0) {
        if (formattedTime) {
            formattedTime += ", ";
        }
        formattedTime += `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }

    if (seconds > 0) {
        if (formattedTime) {
            formattedTime += ", ";
        }
        formattedTime += `${seconds} second${seconds > 1 ? "s" : ""}`;
    }

    return formattedTime || "0 seconds";
};

export const doNothing = () => {};

export const getTimeFromMinuteIndex = (index: number): string => {
    const hours = Math.floor(index / 60)
        .toString()
        .padStart(2, "0");
    const minutes = (index % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};
