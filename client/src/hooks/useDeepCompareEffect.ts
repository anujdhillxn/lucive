import { useEffect, useRef } from "react";
import isEqual from "lodash.isequal";

const useDeepCompareUpdateEffect = (
    callback: React.EffectCallback,
    dependencies: any[]
) => {
    const isInitialRender = useRef(true);
    const currentDependenciesRef = useRef<any[]>([]);

    if (!isEqual(currentDependenciesRef.current, dependencies)) {
        currentDependenciesRef.current = dependencies;
    }

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        return callback();
    }, currentDependenciesRef.current);
};

export default useDeepCompareUpdateEffect;
