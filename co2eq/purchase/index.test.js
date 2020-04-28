import {
  UNITS,
  PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE,
  PURCHASE_CATEGORY_STORE_FOOD,
  UNIT_CURRENCIES,
  ACTIVITY_TYPE_PURCHASE,
} from '../../definitions';
import { getDescendants, getRootEntry, modelCanRun, carbonEmissions } from './index';
import { getAvailableCurrencies } from '../../integrations/utils/currency/currency';


Object.entries(getDescendants(getRootEntry()))
  .filter(([k, v]) => v.unit)
  .forEach(([k, v]) => {
    test(`default unit of ${k}`, () => {
      expect(UNITS).toContain(v.unit);
    });
  });

Object.entries(getDescendants(getRootEntry()))
  .filter(([k, v]) => v.conversions)
  .forEach(([entryKey, v]) => {
    Object.keys(v.conversions)
      .forEach((k) => {
        test(`conversion units of ${entryKey}`, () => {
          expect(UNITS).toContain(k);
        });
      });
  });

test(`available currencies match definition`, () => {
    const defined = Object.keys(UNIT_CURRENCIES);
    const available = getAvailableCurrencies();
    expect(defined.sort()).toEqual(available.sort());
  });

test(`test household appliance for DK in EUR`, () => {
  const activity = {
    activityType: ACTIVITY_TYPE_PURCHASE,
    countryCodeISO2: 'DK',
    datetime: new Date('2020-04-11T10:20:30Z'),
    lineItems: [{
      unit: UNIT_CURRENCIES.EUR,
      value: 15,
      identifier: PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE,
    }],
  };
  expect(modelCanRun(activity)).toBeTruthy();
  // original price * cpi correction * intensity
  expect(carbonEmissions(activity)).toBeCloseTo(15 * (103.3/95.9) * 0.4028253119428596);
});

test(`test household appliance for AU in EUR in 2020, for which there is no cpi data`, () => {
  const activity = {
    activityType: ACTIVITY_TYPE_PURCHASE,
    countryCodeISO2: 'AU',
    datetime: new Date('2020-04-11T10:20:30Z'),
    lineItems: [{
      unit: UNIT_CURRENCIES.EUR,
      value: 15,
      identifier: PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE,
    }],
  };
  expect(modelCanRun(activity)).toBeTruthy();
  // original price * cpi correction * intensity
  expect(carbonEmissions(activity)).toBeCloseTo(15 * (110.72093023255815/92.2) * 0.4428823364363346);
});

test(`test household appliance for DK in DKK`, () => {
  const activity = {
    activityType: ACTIVITY_TYPE_PURCHASE,
    countryCodeISO2: 'DK',
    datetime: new Date('2020-04-11T10:20:30Z'),
    lineItems: [{
      unit: UNIT_CURRENCIES.DKK,
      value: 1150,
      identifier: PURCHASE_CATEGORY_STORE_FOOD,
    }],
  };
  expect(modelCanRun(activity)).toBeTruthy();
  expect(carbonEmissions(activity)).toBeCloseTo(1150 / 7.4644 * (103.3/95.9) * 0.817390437852872);
});
