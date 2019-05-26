import getHourLimit from '../../../../../src/domain/usecases/antecipacao/getHourLimit';

describe('Domain :: UseCases :: Antecipacao :: GetHourLimit', () => {
  test('GetHourLimit show 16:00', async (done) => {
    const hourLimit = await getHourLimit();
    expect(hourLimit).toBe('16:00');
    done();
  });
});
