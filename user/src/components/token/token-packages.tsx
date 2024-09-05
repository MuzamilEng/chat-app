import { paymentService } from '@services/payment.service';
import { packageService } from '@services/token-package.service';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { NumericFormat } from 'react-number-format';
import { toast } from 'react-toastify';

import styles from './token-package.module.scss';
import { useTranslationContext } from 'context/TranslationContext';

function PurchaseTokenList() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const {t, lang} = useTranslationContext()

  const purchasePackage = async (tokenPackage) => {
    if (!window.confirm( lang === 'en' ? 'Are you sure you want to buy this package?' : 'Möchten Sie dieses Paket kaufen?')) {
      return;
    }

    try {
      const data = {
        gateway: 'ccbill',
        service: 'token_package',
        itemId: tokenPackage._id
      };

      const resp = await paymentService.create(data);
      window.open(resp.data);
    } catch (e) {
      const err = await e;
      toast.error(err.data?.message || err.data?.msg || err.msg || 'An error occurred');
    }
  };

  const loadPackages = async () => {
    setLoading(true);
    const resp = await packageService.find({ sort: 'ordering', sortType: 'desc' });
    setPackages(resp.data.items);
    setLoading(false);
  };

  useEffect(() => {
    loadPackages();
  }, []);

  if (!packages.length && !loading) {
    return (
      <div className="row m-0">
        <Alert variant="danger">{t?.tokenAlert}</Alert>
      </div>
    );
  }

  return (
    <div className="row m-0">
      {packages.map((item: any, index: number) => (
        <div className="col-md-3 my-3 col-sm-4 col-xs-6" key={item._id || item.price}>
          <div className={classNames('token_card', styles.token_card)}>
            <div className={classNames('card_image', styles.card_image)}>
              <div className={classNames('coin', styles.coin)}>
                <div className={classNames('current_coin', styles.current_coin)}>
                  <img src="/images/crown.png" alt="" />
                  <span>
                    x
                    {item?.token}
                  </span>
                </div>
              </div>
            </div>
            <p className={classNames('text_secondary', styles.text_secondary)}>
              <NumericFormat thousandSeparator value={item?.token} displayType="text" />
              {' '}
              Token for
              {' '}
              <NumericFormat
                thousandSeparator
                prefix="$"
                value={item?.price}
                displayType="text"
                allowLeadingZeros
                decimalScale={2}
              />
            </p>
            <b className={classNames('text_name', styles.text_name)}>{item?.name}</b>
            <p className={classNames('text_description', styles.text_description)}>{item?.description}</p>
            <a onClick={() => purchasePackage(item)} className="btn px-4 py-2 text-white mt-4 btn-primary">
            {lang === 'en' ? 'Buy Now' : 'Jetzt kaufen'}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PurchaseTokenList;
