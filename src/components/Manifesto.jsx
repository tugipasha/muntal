import React from 'react';

export default function Manifesto() {
  return (
    <section className="section" id="about">
      <div className="section__inner">
        <p className="section__label reveal-text">About — Chapter I</p>
        <h2 className="section__heading reveal-text">Diplomacy is a discipline.</h2>
        <div className="section__grid">
          <p className="section__body reveal-text">
            MUNTAL was founded on a single conviction: that debate, done properly, sharpens
            the mind more than any classroom exercise. We bring together delegates who arrive
            having read the background guide twice, not once.
          </p>
          <p className="section__body reveal-text">
            Held annually in Izmir, the conference gathers students from across the region
            for a week of committee sessions, crisis simulations and resolutions that are
            actually meant to be defensible.
          </p>
        </div>
      </div>
    </section>
  );
}
