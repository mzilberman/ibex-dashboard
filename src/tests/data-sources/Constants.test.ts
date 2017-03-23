import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';

import dataSourceMock from '../mocks/dataSource';

describe('Data Source: Constant', () => {

  let dataSources: IDataSourceDictionary = {};

  beforeAll(() => {

    DataSourceConnector.createDataSources({ dataSources: [ dataSourceMock ]}, dataSources);
    DataSourceConnector.connectDataSources(dataSources);

  });

  it ('Check basic data == 3 rows', () => {

    expect(dataSources).toHaveProperty('data');
    expect(dataSources.data).toHaveProperty('store');
    expect(dataSources.data).toHaveProperty('action');
    expect(dataSources.data.store).toHaveProperty('state');
    expect(dataSources.data.store.state).toMatchObject({
      "selectedValue": "default",
      "someJsonValues": [
        { "count": 2, "id": 1 },
        { "count": 0, "id": 2 },
        { "count": 10, "id": 3 }
      ],
      "values": undefined,
    });
  });

  it ('Check updating of store state', () => {

      dataSources.data.action.updateDependencies();
      expect(dataSources.data.store.state).toMatchObject({
        "selectedValue": "default",
        "someJsonValues": [
          { "count": 2, "id": 1 },
          { "count": 0, "id": 2 },
          { "count": 10, "id": 3 },
          { "count": 10, "id": 3 }
        ],
        "values": undefined,
      });

  });

});