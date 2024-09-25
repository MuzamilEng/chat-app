import { sellItemService } from '@services/sell-item.service';
import { useTranslationContext } from 'context/TranslationContext';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';

const PageTitle = dynamic(() => import('@components/page-title'));

interface IProps {
  authUser: any;
}

function ProfilePage({ authUser }: IProps) {
  const { t, lang } = useTranslationContext();
  const [userLanguages, setUserLanguages] = useState<string[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [userHobbies, setUserHobbies] = useState<string[]>([]);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);

  const languages = ['English', 'German', 'French', 'Spanish', 'Italian', 'Russian'];
  const interests = ['Woman', 'Man', 'Couple', 'Bisexual', 'Trans'];
  const hobbies = ['Relationship', 'Flirt', 'Email Sex', 'One Night Stand', 'Affair', 'frivolous', 'Friendship', 'Fetish-Erotic ', 'BDSM', 'Group Sex', 'Fling'];
  const preferences = ['Flower sex', 'Analsex', 'Oralsex', 'Devot', 'Dominant', 'Toys', 'Swinger', 'Outdoorsex', 'Public Sex', 'Dessous', 'Roleplay', 'Voyeur']

  // Initialize state with authUser data when the component mounts
  useEffect(() => {
    if (authUser) {
      setUserLanguages(authUser.languages || []);  // Default to an empty array if no languages are present
      setUserInterests(authUser.interests || []);
      setUserHobbies(authUser.hobbies || []);
    }
  }, [authUser]);

  // Handle checkbox selection
  const handleCheckboxChange = (value: string, list: string[], setList: (arr: string[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value)); // Remove item if already in the list
    } else {
      setList([...list, value]); // Add item if not in the list
    }
  };

  // Submit the selected interests, languages, and hobbies
  const updateUserInterests = async () => {
    try {
      await sellItemService.updateInterests({
        userId: authUser._id,
        languages: userLanguages,
        interests: userInterests,
        hobbies: userHobbies,
        preferences: userPreferences
      });
      toast.success( lang === 'en' ? 'The interest have been updated successfully' : 'Das Interesse wurde erfolgreich aktualisiert');
      // Optionally handle success or navigate elsewhere
    } catch (err) {
      toast.error(err);
      // Handle error (e.g., show error message)
      console.error(err);
    }
  };

  const renderCheckboxes = (options: string[], selectedList: string[], setList: (arr: string[]) => void) => {
    return (
      <Row>
        {options.map((option, index) => (
          <Col md={4} key={index} className="mb-3">
            <Form.Check 
              type="checkbox"
              label={lang === 'en' ? option : t(option)}
              checked={selectedList.includes(option)} // Check if the option is selected
              onChange={() => handleCheckboxChange(option, selectedList, setList)}
            />
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <main className="main scroll">
      <PageTitle title={lang === 'en' ? 'Media Content' : 'Medieninhalt'} />
      <div className="chats" style={{width: '80%', margin: 'auto', height: '100%', marginLeft: "10%"}}>
        <div className="chat-body p-3">
          <div className="card-header mb-4">
            <h6 className="mb-1">{lang === 'en' ? 'Interest Update' : 'Interesse aktualisieren'}</h6>
            <p className="mb-0 text-muted small">{lang === 'en' ? 'Update your personal interests' : 'Persönliche Interessen aktualisieren'}</p>
          </div>

          <div className="mb-4">
            <h5>{lang === 'en' ? 'Languages' : 'Sprachen'}</h5>
            {renderCheckboxes(languages, userLanguages, setUserLanguages)}
          </div>
          <div className="mb-4">
            <h5>{lang === 'en' ? 'What I am searching for is:' : 'Ich such für ist:'}</h5>
            {renderCheckboxes(interests, userInterests, setUserInterests)}
          </div>
          <div className="mb-4">
            <h5>{lang === 'en' ? 'What I want to have:' : 'Ich will:'}</h5>
            {renderCheckboxes(hobbies, userHobbies, setUserHobbies)}
          </div>
          <div className="mb-4">
            <h5>{lang === 'en' ? 'What are my preferences' : 'Meine Einstellungen:'}</h5>
            {renderCheckboxes(preferences, userPreferences, setUserPreferences)}
          </div>
          <button
            className="btn btn-primary"
            style={{width: '20%', marginLeft: '30%', marginTop: '5%'}}
            onClick={updateUserInterests}
          >
            {lang === 'en' ? 'Save' : 'Speichern'}
          </button>
        </div>
      </div>
    </main>
  );
}

const mapStateToProps = (state: any) => ({
  authUser: state.auth.authUser
});

export default connect(mapStateToProps)(ProfilePage);
