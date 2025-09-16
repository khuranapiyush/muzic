import { useEffect, useState } from 'react';
import { getData, storeData } from '../utils/asyncStorage';

const useEntityExpiry = config => {
  const [isExpired, setIsExpired] = useState(() => {
    return Object.keys(config.items).reduce((acc, cur) => {
      return { ...acc, [cur]: config.items[cur]?.status };
    }, {});
  });

  const [expiryCb, setExpiryCb] = useState({});

  const checkForOnceInDays = async (name, key, every = 1) => {
    try {
      const expiry = (await getData(key)) || 0;
      const currentTime = new Date().getTime();

      if (!expiry || currentTime > parseInt(expiry)) {
        setIsExpired(prev => ({ ...prev, [name]: true }));

        const expiryTime = currentTime + every * 24 * 60 * 60 * 1000;
        await storeData(key, expiryTime.toString());
      }
    } catch (error) {
      console.error(`Error checking for once in days: ${error}`);
    }
  };

  const checkForOncePerSession = async (name, key, every = 1, count = 1) => {
    try {
      const expiry = await getData(key);
      const currentDate = new Date().getTime();

      if (!expiry) {
        setIsExpired(prev => ({ ...prev, [name]: true }));

        const expiryTime = currentDate + every * 24 * 60 * 60 * 1000;

        await storeData(
          key,
          JSON.stringify({
            sessionCount: 1,
            lastDisplayedDate: expiryTime,
            sessionDuration: every,
          })
        );
        return true;
      } else {
        const parsedExpiry = JSON.parse(expiry);

        if (parsedExpiry.lastDisplayedDate >= currentDate) {
          return false;
        } else {
          if (parsedExpiry.sessionCount < count) {
            setIsExpired(prev => ({ ...prev, [name]: true }));
            const expiryTime = currentDate + every * 24 * 60 * 60 * 1000;

            await storeData(
              key,
              JSON.stringify({
                sessionCount: parsedExpiry.sessionCount + 1,
                lastDisplayedDate: expiryTime,
                sessionDuration: every,
              })
            );
            return true;
          } else {
            return false;
          }
        }
      }
    } catch (error) {
      console.error(`Error checking for once per session: ${error}`);
    }
  };

  const checkForEntities = () => {
    const entities = Object.keys(config.items);

    const cbs = {};
    entities.forEach(name => {
      if (config.items[name]?.variant === 'checkForOnceInDays') {
        const { key, every, manual } = config.items[name];
        if (manual) {
          cbs[name] = () => checkForOnceInDays(name, key || name, every);
        } else {
          checkForOnceInDays(name, key || name, every);
        }
      }

      if (config.items[name]?.variant === 'checkForOncePerSession') {
        const { key, every, count, manual } = config.items[name];
        if (manual) {
          cbs[name] = () =>
            checkForOncePerSession(name, key || name, every, count);
        } else {
          checkForOncePerSession(name, key || name, every, count);
        }
      }
    });

    if (Object.keys(cbs).length) {
      setExpiryCb(cbs);
    }
  };

  useEffect(() => {
    checkForEntities();
  }, []);

  return { data: { ...isExpired }, cb: expiryCb };
};

export default useEntityExpiry;
