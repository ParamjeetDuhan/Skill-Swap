import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  fetchMySkills,
  addTeachSkill,
  addLearnSkill,
  removeTeachSkill,
  removeLearnSkill,
} from '../features/skills/skillsSlice';
import Spinner from '../components/Spinner';

const CATEGORIES = ['Programming', 'Music', 'Design', 'Language', 'Art', 'Fitness', 'Cooking', 'Business', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const emptyForm = { name: '', category: CATEGORIES[0], proficiency: 'Beginner', description: '' };

export default function SkillsPage() {
  const dispatch = useDispatch();
  const { skillsToTeach, skillsToLearn, status } = useSelector((state) => state.skills);

  const [teachForm, setTeachForm] = useState(emptyForm);
  const [learnForm, setLearnForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchMySkills());
  }, [dispatch]);

  const submitTeach = async (e) => {
    e.preventDefault();
    if (!teachForm.name.trim()) return toast.error('Skill name is required');
    const result = await dispatch(addTeachSkill(teachForm));
    if (addTeachSkill.fulfilled.match(result)) {
      toast.success('Added to skills you teach');
      setTeachForm(emptyForm);
    } else {
      toast.error(result.payload || 'Failed to add skill');
    }
  };

  const submitLearn = async (e) => {
    e.preventDefault();
    if (!learnForm.name.trim()) return toast.error('Skill name is required');
    const result = await dispatch(addLearnSkill(learnForm));
    if (addLearnSkill.fulfilled.match(result)) {
      toast.success('Added to skills you want to learn');
      setLearnForm(emptyForm);
    } else {
      toast.error(result.payload || 'Failed to add skill');
    }
  };

  if (status === 'loading' && skillsToTeach.length === 0 && skillsToLearn.length === 0) {
    return <Spinner label="Loading your skills..." />;
  }

  return (
    <div className="page">
      <h1>My Skills</h1>
      <p className="subtitle">Add what you can teach and what you'd like to learn — this powers your matches.</p>

      <div className="two-col">
        <section className="panel">
          <h2>Skills I Can Teach</h2>
          <form className="inline-form" onSubmit={submitTeach}>
            <SkillFormFields form={teachForm} setForm={setTeachForm} />
            <button type="submit" className="btn-primary">Add</button>
          </form>
          <ul className="skill-list">
            {skillsToTeach.map((s) => (
              <li key={s._id}>
                <div>
                  <strong>{s.name}</strong> <span className="tag">{s.category}</span> <span className="tag">{s.proficiency}</span>
                  {s.description && <p className="skill-desc">{s.description}</p>}
                </div>
                <button
                  className="btn-danger-small"
                  onClick={() => dispatch(removeTeachSkill(s._id))}
                >
                  Remove
                </button>
              </li>
            ))}
            {skillsToTeach.length === 0 && <p className="empty-state">No skills added yet.</p>}
          </ul>
        </section>

        <section className="panel">
          <h2>Skills I Want to Learn</h2>
          <form className="inline-form" onSubmit={submitLearn}>
            <SkillFormFields form={learnForm} setForm={setLearnForm} />
            <button type="submit" className="btn-primary">Add</button>
          </form>
          <ul className="skill-list">
            {skillsToLearn.map((s) => (
              <li key={s._id}>
                <div>
                  <strong>{s.name}</strong> <span className="tag">{s.category}</span> <span className="tag">{s.proficiency}</span>
                  {s.description && <p className="skill-desc">{s.description}</p>}
                </div>
                <button
                  className="btn-danger-small"
                  onClick={() => dispatch(removeLearnSkill(s._id))}
                >
                  Remove
                </button>
              </li>
            ))}
            {skillsToLearn.length === 0 && <p className="empty-state">No skills added yet.</p>}
          </ul>
        </section>
      </div>
    </div>
  );
}

function SkillFormFields({ form, setForm }) {
  return (
    <>
      <input
        type="text"
        placeholder="Skill name (e.g. React)"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select value={form.proficiency} onChange={(e) => setForm({ ...form, proficiency: e.target.value })}>
        {LEVELS.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Short description (optional)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
    </>
  );
}
