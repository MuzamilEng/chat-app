import { useTranslationContext } from "context/TranslationContext";

type IProps = {
  onFilter: Function;
  showLocation?: boolean;
}

function UserFilter({ onFilter, showLocation = true }: IProps) {

  const germanPostalCodes = [
    "91000", "92000", "93000", "94000", "95000", "96000", "97000", "98000", "99000"
  ];
  const {t} = useTranslationContext();



  return (
    <>
      <div className="dropdown mr-2">
        <select className="btn btn-outline-default dropdown-toggle" onChange={(e) => onFilter(e.target.value)}>
          <option value="">{t?.header?.option?.all}</option>
          <option value="male">{t?.header?.option?.male}</option>
          <option value="female">{t?.header?.option?.female}</option>
          <option value="transgender">{t?.header?.option?.transgender}</option>
        </select>
      </div>
      <div className="dropdown mr-2">
        <select className="btn btn-outline-default dropdown-toggle" onChange={(e) => onFilter(e.target.value)}>
          <option value="">{t?.header?.postcode}</option>
          {germanPostalCodes?.map((i) => <option key={i} value={i}>{i.slice(0, 2)}xxxx</option>)}
        </select>
      </div>
      <div className="dropdown mr-2">
        <select className="btn btn-outline-default dropdown-toggle" onChange={(e) => onFilter(e.target.value)}>
          <option value="">{t?.header?.location}</option>
          {showLocation && <option value="location">{t?.header?.all}</option>}
        </select>
      </div>
    </>
  );
}

export default UserFilter;
