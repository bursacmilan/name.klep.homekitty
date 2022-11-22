module.exports = (Mapper, Service, Characteristic) => {
  const STAY_ARM        = Characteristic.SecuritySystemCurrentState.STAY_ARM;
  const AWAY_ARM        = Characteristic.SecuritySystemCurrentState.AWAY_ARM;
  const NIGHT_ARM       = Characteristic.SecuritySystemCurrentState.NIGHT_ARM;
  const DISARMED        = Characteristic.SecuritySystemCurrentState.DISARMED;
  const ALARM_TRIGGERED = Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED;
  const DISARM          = Characteristic.SecuritySystemTargetState.DISARM;

  const characteristic = {
    characteristics : [ Characteristic.SecuritySystemCurrentState, Characteristic.SecuritySystemTargetState ],
    get : (value, device, characteristic) => {
      // Check various alarm capabilities of the device to see if any of them are triggered.
      // XXX: make this configurable somehow?
      if (characteristic === Characteristic.SecuritySystemCurrentState) {
        for (const alarm of [ 'alarm_generic', 'alarm_contact', 'alarm_motion', 'alarm_heimdall', 'alarm_vibration' ]) {
          if (Mapper.Utils.hasCapabilityWithValue(device, alarm, true)) {
            return ALARM_TRIGGERED;
          }
        }
      }

      // If not, map homealarm_state value
      switch(value) {
        case 'armed':           return AWAY_ARM;
        case 'partially_armed': return STAY_ARM; // or NIGHT_ARM?
        case 'disarmed':        // fall-through
        default:                return DISARMED;
      }
    },
    set : value => {
      switch(value) {
        case AWAY_ARM:  return 'armed';
        case STAY_ARM:  // fall-through
        case NIGHT_ARM: return 'partially_armed';
        case DISARM:    // fall-through
        default:        return 'disarmed';
      }
    }
  };

  return {
    class:    'homealarm',
    service:  Service.SecuritySystem,
    required: {
      homealarm_state : characteristic
    },
    optional : {
      alarm_tamper : {
        characteristics : Characteristic.StatusTampered,
        ...Mapper.Accessors.Boolean
      }
    }
  };
};