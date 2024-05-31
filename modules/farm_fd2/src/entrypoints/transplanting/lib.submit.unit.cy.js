import { lib } from './lib.js';
import * as farmosUtil from '@libs/farmosUtil/farmosUtil';

describe('Submission using the transplanting lib.', () => {
  let form = {
    cropName: 'BROCCOLI',
    picked: [
      {
        trays: 1,
        data: {
          log_id: '1',
          log_uuid: 'ca7b2961-72da-4469-a2f1-af2abfc60082',
          asset_id: '33',
          asset_uuid: '0d0c5dd3-8888-4931-9f8c-e2998e7e9557',
          date: '2019-03-11',
          user: 'admin',
          crop: 'BROCCOLI',
          trays_location: 'CHUAU',
          asset_locations: 'CHUAU',
          total_trays: 4,
          available_trays: 4,
          tray_size: 128,
          seeds_per_cell: 1,
          total_seeds: 512,
          notes: 'First broccoli tray seeding.',
        },
      },
    ],
    transplantingDate: '1950-01-02',
    location: 'ALF',
    beds: ['ALF-1', 'ALF-3'],
    bedFeet: 100,
    bedWidth: 60,
    rowsPerBed: '1',
    equipment: ['Tractor'],
    depth: 6,
    speed: 5,
    comment: 'A comment',
  };

  //let fieldMap = null;
  let categoryMap = null;
  let cropToTerm = null;
  let result = null;

  before(() => {
    cy.restoreLocalStorage();
    cy.restoreSessionStorage();

    // cy.wrap(farmosUtil.getFieldNameToAssetMap()).then((map) => {
    //   fieldMap = map;
    // });

    cy.wrap(farmosUtil.getLogCategoryToTermMap()).then((map) => {
      categoryMap = map;
    });

    cy.wrap(farmosUtil.getCropNameToTermMap()).then((map) => {
      cropToTerm = map;
    });

    cy.wrap(lib.submitForm(form), { timeout: 10000 }).then((res) => {
      result = res;
    });
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.restoreSessionStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
    cy.saveSessionStorage();
  });

  it('Check the parents', () => {
    expect(result.parents[0].id).to.equal(form.picked[0].data.asset_uuid);
    expect(result.parents[0].type).to.equal('asset--plant');
    expect(result.parents[0].attributes.name).to.equal(
      form.picked[0].data.date + '_' + form.picked[0].data.crop
    );
  });

  it('Check the tray inventory quantity--standard assets', () => {
    expect(result.trayInventoryQuantities[0].attributes.value.decimal).to.equal(
      form.picked[0].trays
    );
    expect(result.trayInventoryQuantities[0].type).to.equal(
      'quantity--standard'
    );
    expect(result.trayInventoryQuantities[0].attributes.measure).to.equal(
      'count'
    );
    expect(result.trayInventoryQuantities[0].attributes.label).to.equal(
      'Trays'
    );
    expect(
      result.trayInventoryQuantities[0].attributes.inventory_adjustment
    ).to.equal('decrement');
  });

  it('Check the asset--plant', () => {
    // Check the plant asset.
    expect(result.transplantingAsset.type).to.equal('asset--plant');
    expect(result.transplantingAsset.attributes.name).to.equal(
      form.transplantingDate + '_' + form.cropName
    );

    expect(result.transplantingAsset.attributes.status).to.equal('active');
    expect(result.transplantingAsset.attributes.notes.value).to.equal(
      form.comment
    );

    expect(result.transplantingAsset.relationships.plant_type[0].type).to.equal(
      cropToTerm.get(form.cropName).type
    );

    expect(result.transplantingAsset.relationships.plant_type[0].id).to.equal(
      cropToTerm.get(form.cropName).id
    );
  });

  it('Check the bed feet quantity--standard', () => {
    expect(
      result.transplantingBedFeetQuantity.attributes.value.decimal
    ).to.equal(form.bedFeet);
    expect(result.transplantingBedFeetQuantity.type).to.equal(
      'quantity--standard'
    );
    expect(result.transplantingBedFeetQuantity.attributes.measure).to.equal(
      'length'
    );
    expect(result.transplantingBedFeetQuantity.attributes.label).to.equal(
      'Bed Feet'
    );
  });

  it('Check the rows/bed quantity--standard', () => {
    expect(
      result.transplantingRowsPerBedQuantity.attributes.value.decimal
    ).to.equal(form.rowsPerBed);
    expect(result.transplantingRowsPerBedQuantity.type).to.equal(
      'quantity--standard'
    );
    expect(result.transplantingRowsPerBedQuantity.attributes.measure).to.equal(
      'ratio'
    );
    expect(result.transplantingRowsPerBedQuantity.attributes.label).to.equal(
      'Rows/Bed'
    );
  });

  it('Check the row feet quantity--standard', () => {
    expect(
      result.transplantingRowFeetQuantity.attributes.value.decimal
    ).to.equal(form.rowsPerBed * form.bedFeet);
    expect(result.transplantingRowFeetQuantity.type).to.equal(
      'quantity--standard'
    );
    expect(result.transplantingRowFeetQuantity.attributes.measure).to.equal(
      'length'
    );
    expect(result.transplantingRowFeetQuantity.attributes.label).to.equal(
      'Row Feet'
    );
  });

  it('Check the bed width quantity--standard', () => {
    expect(
      result.transplantingBedWidthQuantity.attributes.value.decimal
    ).to.equal(form.bedWidth);
    expect(result.transplantingBedWidthQuantity.type).to.equal(
      'quantity--standard'
    );
    expect(result.transplantingBedWidthQuantity.attributes.measure).to.equal(
      'length'
    );
    expect(result.transplantingBedWidthQuantity.attributes.label).to.equal(
      'Bed Width'
    );
  });

  it('Check the log--activity', () => {
    cy.wrap(
      farmosUtil.getTransplantingActivityLog(result.transplantingLog.id)
    ).then((transplantingLog) => {
      expect(transplantingLog.type).to.equal('log--activity');
      expect(transplantingLog.attributes.name).to.equal(
        '1950-01-02_xp_BROCCOLI'
      );
      expect(transplantingLog.attributes.timestamp).to.contain('1950-01-02');
      expect(transplantingLog.attributes.status).to.equal('done');
      expect(transplantingLog.attributes.is_movement).to.be.true;

      expect(transplantingLog.relationships.location.length).to.equal(3);
      expect(transplantingLog.relationships.location[0].id).to.equal(
        result.transplantingLog.relationships.location[0].id
      );
      expect(transplantingLog.relationships.location[1].id).to.equal(
        result.transplantingLog.relationships.location[1].id
      );
      expect(transplantingLog.relationships.location[2].id).to.equal(
        result.transplantingLog.relationships.location[2].id
      );

      expect(transplantingLog.relationships.asset[0].type).to.equal(
        'asset--plant'
      );
      expect(transplantingLog.relationships.asset[0].id).to.equal(
        result.transplantingLog.relationships.asset[0].id
      );

      expect(transplantingLog.relationships.category.length).to.equal(1);
      expect(transplantingLog.relationships.category[0].type).to.equal(
        'taxonomy_term--log_category'
      );
      expect(transplantingLog.relationships.category[0].id).to.equal(
        result.transplantingLog.relationships.category[0].id
      );

      expect(transplantingLog.relationships.quantity.length).to.equal(5);

      for (let i = 0; i < 5; i++) {
        expect(transplantingLog.relationships.quantity[i].type).to.equal(
          'quantity--standard'
        );
        expect(transplantingLog.relationships.quantity[i].id).to.equal(
          result.transplantingLog.relationships.quantity[i].id
        );
      }
    });
  });

  it('Check the depth quantity--standard', () => {
    expect(result.depthQuantity.attributes.value.decimal).to.equal(form.depth);
    expect(result.depthQuantity.type).to.equal('quantity--standard');
    expect(result.depthQuantity.attributes.measure).to.equal('length');
    expect(result.depthQuantity.attributes.label).to.equal('Depth');
  });

  it('Check the speed quantity--standard', () => {
    expect(result.speedQuantity.attributes.value.decimal).to.equal(form.speed);
    expect(result.speedQuantity.type).to.equal('quantity--standard');
    expect(result.speedQuantity.attributes.measure).to.equal('rate');
    expect(result.speedQuantity.attributes.label).to.equal('Speed');
  });

  it('Check the soil disturbance log--activity', () => {
    cy.wrap(
      farmosUtil.getSoilDisturbanceActivityLog(result.activityLog.id)
    ).then((activityLog) => {
      expect(activityLog.type).to.equal('log--activity');
      expect(activityLog.attributes.name).to.equal('1950-01-02_sd_ALF');
      expect(activityLog.attributes.timestamp).to.contain('1950-01-02');
      expect(activityLog.attributes.status).to.equal('done');
      expect(activityLog.attributes.is_movement).to.equal(false);

      expect(activityLog.relationships.location.length).to.equal(3);
      expect(activityLog.relationships.location[0].id).to.equal(
        result.activityLog.relationships.location[0].id
      );
      expect(activityLog.relationships.location[0].type).to.equal(
        'asset--land'
      );
      expect(activityLog.relationships.location[1].id).to.equal(
        result.activityLog.relationships.location[1].id
      );
      expect(activityLog.relationships.location[1].type).to.equal(
        'asset--land'
      );
      expect(activityLog.relationships.location[2].id).to.equal(
        result.activityLog.relationships.location[2].id
      );
      expect(activityLog.relationships.location[2].type).to.equal(
        'asset--land'
      );

      expect(activityLog.relationships.asset.length).to.equal(1);
      expect(activityLog.relationships.asset[0].id).to.equal(
        result.transplantingAsset.id
      );
      expect(activityLog.relationships.asset[0].type).to.equal('asset--plant');

      expect(activityLog.relationships.category.length).to.equal(2);
      expect(activityLog.relationships.category[0].id).to.equal(
        categoryMap.get('tillage').id
      );
      expect(activityLog.relationships.category[0].type).to.equal(
        'taxonomy_term--log_category'
      );
      expect(activityLog.relationships.category[1].id).to.equal(
        categoryMap.get('transplanting').id
      );
      expect(activityLog.relationships.category[1].type).to.equal(
        'taxonomy_term--log_category'
      );

      expect(activityLog.relationships.quantity.length).to.equal(2);
      expect(activityLog.relationships.quantity[0].id).to.equal(
        result.depthQuantity.id
      );
      expect(activityLog.relationships.quantity[0].type).to.equal(
        'quantity--standard'
      );
      expect(activityLog.relationships.quantity[1].id).to.equal(
        result.speedQuantity.id
      );
      expect(activityLog.relationships.quantity[1].type).to.equal(
        'quantity--standard'
      );
      expect(activityLog.relationships.equipment.length).to.equal(1);
      expect(activityLog.relationships.equipment[0].id).to.equal(
        result.equipmentAssets[0].id
      );
      expect(activityLog.relationships.equipment[0].type).to.equal(
        'asset--equipment'
      );
    });
  });
});
